const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: '*', // replace with the origin you want to allow
  methods: 'GET,POST', // replace with the methods you want to allow
  allowedHeaders: 'Content-Type,Authorization' // replace with the headers you want to allow
};

app.use(cors(corsOptions));
// app.use(cors());

const email = process.env.EMAIL;
const token = process.env.TOKEN;
const encodedCredentials = Buffer.from(`${email}:${token}`).toString('base64');

app.use(express.static(__dirname));

// app.use((req, res, next) => {
//   res.header("Content-Security-Policy", "frame-ancestors https://play.workadventu.re");
//   next();
// });
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'playersInformations.html'));
});

app.get('/winner', async (req, res) => {
    const user1 = req.query.user1;
    const user2 = req.query.user2;
    const time = parseInt(req.query.time) || 1; // Default time is set to 1 minute
    const user1Data = await getResolvedIssueCount(user1);
    const user2Data = await getResolvedIssueCount(user2);
  
    res.json({ 
      user1: { name: user1, count: user1Data.count, time: time }, 
      user2: { name: user2, count: user2Data.count, time: time }
    });
});

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
      alert('Error checking name in project:', error);
      throw error;
    }

  }

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
