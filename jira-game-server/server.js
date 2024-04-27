const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();



const app = express();
const corsOptions = {
  origin: '*', //all origin
  methods: 'GET,POST', 
  allowedHeaders: 'Content-Type,Authorization' 
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
    res.sendFile(path.join(__dirname, 'playersInformation.html'));
});

app.get('/winner', async (req, res) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;
  const startTime = req.query.startTime;
  const endTime = req.query.endTime;
  const user1Data = await getResolvedIssueCount(user1, startTime, endTime);
  const user2Data = await getResolvedIssueCount(user2, startTime, endTime);
  const user1Issues = user1Data.issues.map(issue => `${issue.summary} - ${issue.key}`);
  const user2Issues = user2Data.issues.map(issue => `${issue.summary} - ${issue.key}`);
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

app.listen(3030, () => {
  console.log('Server is running on port 3030');
});
