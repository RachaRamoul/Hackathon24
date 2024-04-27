const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: ['http://localhost:5173', 'https://play.workadventu.re'], // replace with the origin you want to allow
  methods: 'GET,POST', // replace with the methods you want to allow
  allowedHeaders: 'Content-Type,Authorization' // replace with the headers you want to allow
};
app.use(cors(corsOptions));

const email = process.env.EMAIL;
const token = process.env.TOKEN;
const encodedCredentials = Buffer.from(`${email}:${token}`).toString('base64');

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'playersInformations.html'));
});

const server = http.createServer(app);
const io = socketIo(server);

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  // Écoute de l'événement "startMatch" pour démarrer un match avec une durée personnalisée
  socket.on('startMatch', ({player1, player2, matchDurationInSeconds}) => {
    console.log('Début du match avec une durée de', matchDurationInSeconds, 'secondes');

    const informationDisplayState = 'none';
    io.emit('informationDisplay');

    // Calcul de l'heure de fin du match en fonction de la durée saisie par l'utilisateur
    const endTime = Date.now() + matchDurationInSeconds * 1000;

    // Envoyer périodiquement l'heure actuelle aux clients
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = Math.max(0, endTime - currentTime);
      io.emit('updateTimer', Math.floor(remainingTime / 1000));

      if (remainingTime <= 0) {
        clearInterval(interval);
        console.log('Fin du match');

        axios.get(`http://localhost:3000/winner?user1=${player1}&user2=${player2}&time=${matchDurationInSeconds}`)
          .then(response => {
            io.emit('matchResult', response.data);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }

    }, 1000);
  });
});

app.get('/winner', async (req, res) => {
    const user1 = req.query.user1;
    const user2 = req.query.user2;
    const time = parseInt(req.query.time) || 1; // Default time is set to 1 minute
    const user1Data = await getResolvedIssueCount(user1, time);
    const user2Data = await getResolvedIssueCount(user2, time);
  
    res.json({ 
      user1: { name: user1, count: user1Data.count, time: user1Data.time }, 
      user2: { name: user2, count: user2Data.count, time: user2Data.time }
    });
});

// Fonction pour récupérer le nombre de tickets résolus par un utilisateur
async function getResolvedIssueCount(user, time) {
    try{
      const response = await axios.get('https://hackathon-2024.atlassian.net/rest/api/3/search', {
      params: {
        jql: `project = "KAN" AND assignee = "${user}" AND status = Done`,
        fields: 'summary',
      },
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        Accept: 'application/json',
      },
    });
  
    return { count: response.data.issues.length, time: time };
    }catch(error){
      console.error('Error checking name in project:', error);
      throw error;
    }
}

// Démarrage du serveur HTTP
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
