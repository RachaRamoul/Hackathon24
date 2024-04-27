  const socket = io();
  
  // Écoute de la soumission du formulaire de durée du match
document.getElementById('start-match-button').addEventListener('click', () => {
    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const matchDurationInMinutes = parseInt(document.getElementById('time').value);
    if (!checkName(player1, player2) || !checkDuration(matchDurationInMinutes)) {
        return;
    }
    const matchDurationInSeconds = matchDurationInMinutes * 60;
    const divNoneDisplay = document.getElementById('information');
    divNoneDisplay.style.display = 'none';
    socket.emit('startMatch', {player1, player2, matchDurationInSeconds});

});

socket.on('informationDisplay', ()=>{
    const divNoneDisplay = document.getElementById('information');
    divNoneDisplay.style.display = 'none';
});

// Écoute de l'événement 'updateTimer' pour mettre à jour le chronomètre
socket.on('updateTimer', (remainingSeconds) => {
    const { hours, minutes, seconds } = calculateTimeComponents(remainingSeconds);
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingSeconds <= 10) {
        timerElement.style.color = 'red';
    }else if(remainingSeconds <= 30){
        timerElement.style.color = 'orange';
    } else {
        timerElement.style.color = 'black';
    }

});

socket.on('matchResult', (data) => {
    displayResult(data);
});

function calculateTimeComponents(remainingSeconds) {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return { hours, minutes, seconds };
}

function formatTimeToDisplay(hours, minutes, seconds) {
    let displayText = ''; 
    if (hours > 0) {
        displayText += `${hours} hour${hours > 1 ? 's' : ''}`;
        displayText += (minutes > 0 && seconds === 0) ? ' and ' : '';
    }if (minutes > 0) {
        displayText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        displayText += (seconds > 0) ? ' and ' : '';
    }if (seconds > 0) {
        displayText += `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
    return displayText;
}
  
function checkName(player1, player2) {
    const player1Error = document.getElementById('player1Error');
    const player2Error = document.getElementById('player2Error');

    if (!player1) {
        player1Error.textContent = 'Please enter a valid name for Player 1.';
        return false;
    }if(!player2){
        player2Error.textContent = 'Please enter a valid name for Player 2.';
        return false;
    }else {
        player1Error.textContent = '';
        player2Error.textContent = '';
        return true;
    }
}

function checkDuration(matchDuration) {
    const timeError = document.getElementById('timeError');
    if (isNaN(matchDuration) || !Number.isInteger(matchDuration) || matchDuration < 0 || matchDuration > 420) {
        timeError.textContent = 'Please enter a valid game duration between 1 and 420 minutes.';
        return false;
    } else {
        timeError.textContent = '';
        return true;
    }
}

function resetErrors(){
    const timeError = document.getElementById('timeError');
    const player1Error = document.getElementById('player1Error');
    const player2Error = document.getElementById('player2Error');
    const startButton = document.getElementById('startButton');
    player1Error.textContent = '';
    player2Error.textContent = '';
    timeError.textContent = '';
    startButton.disabled = false;

}

function startGame() {
    resetErrors();
    if(!checkName() || !checkDuration() ){
        return false;
    }
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    const time = document.getElementById('time').value || 1; // Default time is set to 1 minute

    // Start the timer
    const timerDisplay = document.getElementById('timer');
    startTimer(time * 60, timerDisplay, () => {
        fetch(`http://localhost:3000/winner?user1=${player1}&user2=${player2}&time=${time}`)
            .then(response => response.json())
            .then(data => {
                displayResult(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

function displayResult(data) {
    const winner = document.getElementById('winner');
    const { hours, minutes, seconds } = calculateTimeComponents(data.user1.time);

    if (data.user1.count > data.user2.count) {
        winner.innerHTML = `<div class="winner">${data.user1.name} is the winner with ${data.user1.count} resolved issues in ${formatTimeToDisplay(hours, minutes, seconds)}!</div>`;
    } else if (data.user2.count > data.user1.count) {
        winner.innerHTML = `<div class="winner">${data.user2.name} is the winner with ${data.user2.count} resolved issues in ${formatTimeToDisplay(hours, minutes, seconds)}!</div>`;
    } else {
        winner.innerHTML = `<div class="winner">It's a tie! Both ${data.user1.name} and ${data.user2.name} have resolved ${data.user1.count} issues in ${formatTimeToDisplay(hours, minutes, seconds)}.</div>`;
    }
}