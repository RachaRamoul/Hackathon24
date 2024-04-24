import axios from 'axios';

const jiraApi = axios.create({
  baseURL: 'https://hackathon-2024.atlassian.net/rest/api/3',
  headers: {
    Authorization: `Basic ${Buffer.from('rachaafaf15@gmail.com:ATATT3xFfGF02G21Jqhnok0Uavnuyt9uzKQbh22-aQGuJqA9KpwN-DRZ1twWBbUO2fdVhrWHoCW6bmVZWgQQ6UXxPNdjPN4MKmsuQzloveEA386YMhfLeKk13n5xyVBSygA0iL2Xm6TlTF_z5BxXkrraYOuam0MGkbQC1JfADs4Bovr_sAevS5c=079C5884').toString('base64')}`,
    Accept: 'application/json',
  },
});

async function getResolvedIssueCount(user) {
  const response = await jiraApi.get('/search', {
    params: {
      jql: `project = "KAN" AND assignee = "${user}" AND status = Done`,
      fields: 'summary',
    },
  });

  return response.data.issues.length;
}

async function printWinner(user1, user2) {
  const user1Count = await getResolvedIssueCount(user1);
  const user2Count = await getResolvedIssueCount(user2);

  if (user1Count > user2Count) {
    console.log(`${user1} is the winner with ${user1Count} resolved issues!`);
  } else if (user2Count > user1Count) {
    console.log(`${user2} is the winner with ${user2Count} resolved issues!`);
  } else {
    console.log(`It's a tie! Both ${user1} and ${user2} have resolved ${user1Count} issues.`);
  }
}

printWinner('Ramoul Racha', 'sarahlina salamani');