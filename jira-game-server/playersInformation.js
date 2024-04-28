  const socket = io();
  
  // Écoute de la soumission du formulaire de durée du match
document.getElementById('start-match-button').addEventListener('click', () => {
    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const matchDurationInMinutes = parseInt(document.getElementById('time').value);
    if (!checkName(player1, player2) || !checkDuration(matchDurationInMinutes)) {

        return;
    }
    document.getElementById('timerLogo').style.display = 'block';
    const matchDurationInSeconds = matchDurationInMinutes * 60;
    socket.emit('startMatch', {player1, player2, matchDurationInSeconds});

});

socket.on('informationDisplay', ()=>{
    const divNoneDisplay = document.getElementById('information');
    divNoneDisplay.style.display = 'none';
    document.getElementById('timerLogo').style.display = 'block';

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
        if(!player2){
            player2Error.textContent = 'Please enter a valid name for Player 2.';
        }else{
            player2Error.textContent = '';
        }
        return false;
    }else{
        player1Error.textContent = '';
        if(!player2){
            player2Error.textContent = 'Please enter a valid name for Player 2.';
            return false;
        }else{
            player2Error.textContent = '';
            return true;
        }
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


function displayResult(data) {
    const timerLogo = document.getElementById('timerLogo');
    timerLogo.style.display = 'none';
    const winnerLogo = document.getElementById('winnerLogo');
    winnerLogo.src = 'https://media.istockphoto.com/id/951077800/vector/vector-pixel-art-isolated-cartoon.jpg?s=612x612&w=0&k=20&c=DHat-uqJMB8YpLQDIDeRORT_Q6MsEU3tMLCTAwy4f2Q='; 
    winnerLogo.alt = 'Symbolic Link'; 
    winnerLogo.style.display = 'block';
    const winner = document.getElementById('winner');
    let winnerMessage = '';
    let user1Issues = '';
    let user2Issues = '';

    // Generate the list of issues for each user or output 'None' if no issues have been resolved
    user1Issues = data.user1.issues.length ? data.user1.issues.map(issue => `<li>${issue}</li>`).join('') : 'None';
    user2Issues = data.user2.issues.length ? data.user2.issues.map(issue => `<li>${issue}</li>`).join('') : 'None';

    // Determine the winner and generate the winner message
    if (data.user1.count > data.user2.count) {
        winnerMessage = `<div class="winner">${data.user1.name} is the winner with ${data.user1.count} resolved issues!</div>`;
    } else if (data.user2.count > data.user1.count) {
        winnerMessage = `<div class="winner">${data.user2.name} is the winner with ${data.user2.count} resolved issues!</div>`;
    } else {
        winnerMessage = `<div class="winner">It's a tie! Both ${data.user1.name} and ${data.user2.name} have resolved ${data.user1.count} issues.</div>`;
    }

    // Display the winner message and the list of issues for each user
    winner.innerHTML = `
        ${winnerMessage}
        <div>
            <div class="issue-box">
                <h3>${data.user1.name}'s resolved issues:</h3>
                <ul>${user1Issues}</ul>
            </div>
            <div class="issue-box">
                <h3>${data.user2.name}'s resolved issues:</h3>
                <ul>${user2Issues}</ul>
            </div>
        </div>
    `;
}



