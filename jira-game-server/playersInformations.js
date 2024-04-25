function checkName() {
    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const player1Error = document.getElementById('player1Error');
    const player2Error = document.getElementById('player2Error');

    if (player1 === '' || player2 === '') {
        player1Error.textContent = 'Please enter a valid name for Player 1.';
        player2Error.textContent = 'Please enter a valid name for Player 2.';
        return false;
    } else {
        player1Error.textContent = '';
        player2Error.textContent = '';
        return true;
    }
}

function checkDuration() {
    const timeInput = document.getElementById('time');
    const timeValue = parseInt(timeInput.value, 10);
    const timeError = document.getElementById('timeError');

    if (isNaN(timeValue) || !Number.isInteger(timeValue) || timeValue < 0 || timeValue > 420) {
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
    return new Promise((resolve, reject) => {
        const player1 = document.getElementById('player1').value;
        const player2 = document.getElementById('player2').value;
        fetch(`/winner?user1=${player1}&user2=${player2}`)
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function startTimer(duration, display) {
    console.log('laaaa');
    let timer = duration, minutes, seconds;
    const intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timer <= 30) {
            display.style.color = 'red';
        } else {
            display.style.color = '#666';
        }

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(intervalId);
            startGame().then(data => {
                // Display the results here
                if (data.user1.count > data.user2.count) {
                    winner.innerHTML = `<div class="winner">${data.user1.name} is the winner with ${data.user1.count} resolved issues!</div>`;
                } else if (data.user2.count > data.user1.count) {
                    winner.innerHTML = `<div class="winner">${data.user2.name} is the winner with ${data.user2.count} resolved issues!</div>`;
                } else {
                    winner.innerHTML = `<div class="winner">It's a tie! Both ${data.user1.name} and ${data.user2.name} have resolved ${data.user1.count} issues.</div>`;
                }
            });
        }
    }, 1000);
}

document.getElementById('time').addEventListener('change', function () {
    console.log('ici');
    const time = parseInt(document.getElementById('time').value) * 60;
    const timerDisplay = document.getElementById('timer');
    console.log('non ici');

    startTimer(time, timerDisplay);
});