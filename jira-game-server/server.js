const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());

const email = process.env.EMAIL;
const token = process.env.TOKEN;
const encodedCredentials = Buffer.from(`${email}:${token}`).toString('base64');

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'playersInformations.html'));
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

async function getResolvedIssueCount(user, time) {
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
  }

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
