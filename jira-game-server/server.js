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



async function getResolvedIssueCount(user, time) {
    // Calculer la date de début en fonction de la durée du minuteur
    const startDate = new Date(Date.now() - (time * 60 * 1000)); // Soustraire la durée en minutes de la date actuelle

    const response = await axios.get('https://hackathon-2024.atlassian.net/rest/api/3/search', {
        params: {
            jql: `project = "KAN" AND assignee = "${user}" AND status = Done AND resolutiondate >= "${startDate.toISOString()}"`,
            fields: 'summary,key,id', // Assurez-vous que les IDs sont récupérés
        },
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
            Accept: 'application/json',
        },
    });

    const issues = response.data.issues.map(issue => ({
        summary: issue.fields.summary,
        key: issue.key,
        id: issue.id, // Assurez-vous que l'ID est correctement récupéré
    }));

    return { count: response.data.issues.length, time: time, issues: issues };
}


app.get('/winner', async (req, res) => {
    const user1 = req.query.user1;
    const user2 = req.query.user2;
    const time = parseInt(req.query.time) || 1; 
    const user1Data = await getResolvedIssueCount(user1, time);
    const user2Data = await getResolvedIssueCount(user2, time);

    // Convertir chaque objet issue en une chaîne de caractères
    const user1Issues = user1Data.issues.map(issue => `${issue.summary} - ${issue.key} - ${issue.id}`);
    const user2Issues = user2Data.issues.map(issue => `${issue.summary} - ${issue.key} - ${issue.id}`);
  
    res.json({ 
      user1: { name: user1, count: user1Data.count, time: user1Data.time, issues: user1Issues }, 
      user2: { name: user2, count: user2Data.count, time: user2Data.time, issues: user2Issues }
    });
});





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
