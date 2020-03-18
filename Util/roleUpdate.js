const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const getUser = require('./getUser');

module.exports = roleUpdate;

let roleArray = ['Surfer', 'Super Surfer', 'Epic Surfer', 'Legendary Surfer', 'Mythic Surfer'];

async function roleUpdate(guild) {
    try {
        const rolesAll = await guild.roles;
        const roles = await rolesAll.filter(r => roleArray.includes(r.name));
        var users = {};
        const token = await getGoogleAuth();
        const sheet = google.sheets('v4');
        const data = (await sheet.spreadsheets.values.get({
            auth: token,
            spreadsheetId: process.env.gSheetS3,
            range: 'Points Sheet!A3:E'
        })).data;
        const rows = await data.values;
        for (i=0;i<rows.length;i++) {
            const row = rows[i];
            if (row[1]) {
                if (!users[row[1]]) users[row[1]] = {};
                if (!users[row[1]].points) users[row[1]].points = row[0];
                if (users[row[1]].points < row[0]) users[row[1]].points = row[0];
            }
            if (row[4]) {
                if (!users[row[4]]) users[row[4]] = {};
                if (!users[row[4]].points) users[row[4]].points = row[3];
                if (users[row[4]].points < row[3]) users[row[4]].points = row[3];
            }
        }
        for (var property in users) {
            const user = await getUser(guild, String(property));
            if (!user.user) continue;
            const roleStr = await getNewRole(Number(users[property].points));
            if (!roleStr) {
                const userRole = await getCurRole(roles, user);
                if (userRole.size) await user.removeRoles(userRole);
                continue;
            }

            //if (user.roles.find(r => r.name === roleStr)) continue;
            var curRole = await getCurRole(roles, user);
            if (curRole.size) await user.removeRoles(curRole);
            var newRole = roles.find(r => r.name === roleStr);
            await user.addRoles(newRole);
        }
    } catch (err) {
        console.log('An error occured in roleUpdate: '+err.message);
        console.log(err.stack);
    }
}

function getNewRole(points) {
    if (points < 300) return;
    if (points < 1000) return 'Surfer';
    if (points < 2000) return 'Super Surfer';
    if (points < 4000) return 'Epic Surfer';
    if (points < 5500) return 'Legendary Surfer';
    return 'Mythic Surfer';
}

function getCurRole(roles, user) {
    return user.roles.filter(r => {
        var match = false;
        roles.forEach((key, value, map) => {
            if (key.name === r.name) {
                csonole.log(`${key.name} - ${r.name)}`);
                match = true;
                break;
            }
        });
        return match;
    });
}
