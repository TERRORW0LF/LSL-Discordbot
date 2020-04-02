const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const getUser = require('./getUser');

module.exports = roleUpdate;

let roleArray = ['Surfer - S3', 'Super Surfer - S3', 'Epic Surfer - S3', 'Legendary Surfer - S3', 'Mythic Surfer - S3'];

async function roleUpdate(guild, season) {
    try {
        if (season != "season3") return;
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
                if (userRole.size) {
                    console.log(`${user.user.tag} - ${userRole.values().next().value.name} - None`);
                    await user.removeRole(userRole.find(r => {return true;}));
                }
                continue;
            }

            if (user.roles.find(r => r.name === roleStr)) continue;
            var curRole = await getCurRole(roles, user);
            if (curRole.size) await user.removeRole(curRole.find(r => {return true;}));
            var newRole = await roles.find(r => r.name === roleStr);
            console.log(`${user.user.tag} - ${curRole.values().next().value.name} - ${newRole.name}`);
            await user.addRole(newRole);
        }
        console.log('\nRoleUpdate done\n');
    } catch (err) {
        console.log('An error occured in roleUpdate: '+err.message);
        console.log(err.stack);
    }
}

function getNewRole(points) {
    if (points < 300) return;
    if (points < 1000) return 'Surfer - S3';
    if (points < 2000) return 'Super Surfer - S3';
    if (points < 4000) return 'Epic Surfer - S3';
    if (points < 5500) return 'Legendary Surfer - S3';
    return 'Mythic Surfer - S3';
}

function getCurRole(roles, user) {
    return user.roles.filter(r => {
        var match = false;
        roles.forEach((key, value, map) => {
            if (match === true) return;
            if (key.name === r.name) {
                match = true;
            }
        });
        return match;
    });
}

function Sleep(milliseconds) {
   return new Promise(resolve => setTimeout(resolve, milliseconds));
}
