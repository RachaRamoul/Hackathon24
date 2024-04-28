const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
const email = process.env.EMAIL;
const token = process.env.TOKEN;
const encodedCredentials = Buffer.from(`${email}:${token}`).toString('base64');
const corsOptions = {
  origin: ['*'],
  methods: 'GET,POST', 
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'playersInformation.html'));
});

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  // Écoute de l'événement "startMatch" pour démarrer un match avec une durée personnalisée
  socket.on('startMatch', ({player1, player2, matchDurationInSeconds}) => {
    const startTimeJiraFormat = toJiraDateTimeFormat(new Date());
    console.log(startTimeJiraFormat ,' \\!/ Début du match avec une durée de', matchDurationInSeconds, 'secondes');
    io.emit('informationDisplay');

    const endTime = Date.now() + matchDurationInSeconds * 1000;
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = Math.max(0, endTime - currentTime);
      io.emit('updateTimer', Math.floor(remainingTime / 1000));

      if (remainingTime <= 0) {
        clearInterval(interval);
        const endTimeJiraFormat = toJiraDateTimeFormat(new Date());
        console.log(endTimeJiraFormat ,' \\!/ Fin du match');

        axios.get(`http://localhost:${PORT}/winner?user1=${player1}&user2=${player2}&time=${matchDurationInSeconds}&startTime=${startTimeJiraFormat}&endTime=${endTimeJiraFormat}`)
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
  const startTime = req.query.startTime;
  const endTime = req.query.endTime;
  const user1Data = await getResolvedIssueCount(user1, startTime, endTime);
  const user2Data = await getResolvedIssueCount(user2, startTime, endTime);
  const user1Issues = user1Data.issues.map(issue => `${issue.key} - ${issue.summary} `);
  const user2Issues = user2Data.issues.map(issue => `${issue.key} - ${issue.summary}`);
  res.json({ 
    user1: { name: user1, count: user1Data.count, time: user1Data.time, issues: user1Issues }, 
    user2: { name: user2, count: user2Data.count, time: user2Data.time, issues: user2Issues }
  });
});

async function getResolvedIssueCount(user, startTime, endTime) {
  try{
    const response = await axios.get('https://hackathon-2024.atlassian.net/rest/api/3/search', {
    params: {
      jql: `project = "KAN" AND assignee = "${user}" AND status = Done AND resolutiondate >= "${startTime}" AND resolutiondate <= "${endTime}"`,
      fields: 'summary,key',
    },
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      Accept: 'application/json',
    },
  });
  const issues = response.data.issues.map(issue => ({
      summary: issue.fields.summary,
      key: issue.key,
  }));
  return { count: response.data.issues.length, time: endTime - startTime, issues: issues };
  }catch(error){
    console.error('Error checking name in project:', error);
    throw error;
  }
}

function toJiraDateTimeFormat(date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
