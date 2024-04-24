const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());

const email = 'rachaafaf15@gmail.com';
const token = 'ATATT3xFfGF02G21Jqhnok0Uavnuyt9uzKQbh22-aQGuJqA9KpwN-DRZ1twWBbUO2fdVhrWHoCW6bmVZWgQQ6UXxPNdjPN4MKmsuQzloveEA386YMhfLeKk13n5xyVBSygA0iL2Xm6TlTF_z5BxXkrraYOuam0MGkbQC1JfADs4Bovr_sAevS5c=079C5884';
const encodedCredentials = Buffer.from(`${email}:${token}`).toString('base64');

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'displayWinner.html'));
});

app.get('/winner', async (req, res) => {
  const user1 = 'Ramoul Racha';
  const user2 = 'sarahlina salamani';
  const user1Count = await getResolvedIssueCount(user1);
  const user2Count = await getResolvedIssueCount(user2);

  if (user1Count > user2Count) {
    res.json({ winner: `${user1} is the winner with ${user1Count} resolved issues!` });
  } else if (user2Count > user1Count) {
    res.json({ winner: `${user2} is the winner with ${user2Count} resolved issues!` });
  } else {
    res.json({ winner: `It's a tie! Both ${user1} and ${user2} have resolved ${user1Count} issues.` });
  }
});

async function getResolvedIssueCount(user) {
  const response = await axios.get('https://hackathon-2024.atlassian.net/rest/api/3/search', {
    params: {
      jql: `project = "KAN" AND assignee = "${user}" AND status = Done`,
      fields: 'summary',
    },
    headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        Accept: 'application/json',
    }
  });

  return response.data.issues.length;
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
