const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const getUser = require('./getUser');

module.exports = roleUpdate;

let roleArray1 = ['Surfer - S1', 'Super Surfer - S1', 'Epic Surfer - S1', 'Legendary Surfer - S1', 'Mythic Surfer - S1'];
let roleArray2 = ['Surfer - S2', 'Super Surfer - S2', 'Epic Surfer - S2', 'Legendary Surfer - S2', 'Mythic Surfer - S2'];
let roleArray3 = ['Surfer - S3', 'Super Surfer - S3', 'Epic Surfer - S3', 'Legendary Surfer - S3', 'Mythic Surfer - S3'];

async function roleUpdate(guild, season) {
    try {
        var roleArray;
        var sheetId;
        if (season == "season1") {
            season = 1;
            roleArray = roleArray1;
            sheetId = process.env.gSheetS1;
        } else if (season == "season2") {
            season = 2;
            roleArray = roleArray2;
            sheetId = process.env.gSheetS2;
        } else if (season == "season3") {
            season = 3;
            roleArray = roleArray3;
            sheetId = process.env.gSheetS3;
        } else return;
        const rolesAll = await guild.roles;
        const roles = await rolesAll.filter(r => roleArray.includes(r.name));
        const roleStanFirst = await rolesAll.find(r => r.name === `Rank 1 Standard - S${season}`);
        const roleGravFirst = await rolesAll.find(r => r.name === `Rank 1 Gravspeed - S${season}`);
        var users = {};
        var stanUsers = [];
        var gravUsers = [];
        const token = await getGoogleAuth();
        const sheet = google.sheets('v4');
        const data = (await sheet.spreadsheets.values.get({
            auth: token,
            spreadsheetId: sheetId,
            range: 'Points Sheet!A3:E'
        })).data;
        const rows = await data.values;
        for (i=0;i<rows.length;i++) {
            const row = rows[i];
            if (row[1]) {
                stanUsers.push([row[1], Number(row[0])]);
                if (!users[row[1]]) users[row[1]] = {};
                if (!users[row[1]].points) users[row[1]].points = Number(row[0]);
                if (users[row[1]].points < Number(row[0])) users[row[1]].points = Number(row[0]);
            }
            if (row[4]) {
                gravUsers.push([row[4], Number(row[3])]);
                if (!users[row[4]]) users[row[4]] = {};
                if (!users[row[4]].points) users[row[4]].points = Number(row[3]);
                if (users[row[4]].points < Number(row[3])) users[row[4]].points = Number(row[3]);
            }
        }
        await stanUsers.sort((a, b) => b[1] - a[1]);
        console.log(stanUsers);
        const firstStan = await getUser(guild, stanUsers[0][0]);
        if (firstStan.user) {
            if (!firstStan.roles.find(r => r.name === `Rank 1 Standard - S${season}`)) firstStan.addRole(roleStanFirst);
        }
        stanUsers.shift();
        for (var user of stanUsers) {
            const disUser = await getUser(guild, user[0]);
            if (!disUser.user) continue;
            if (disUser.roles.find(r => r.name === `Rank 1 Standard - S${season}`)) {
                disUser.removeRole(roleStanFirst);
                break;
            }
        }
        await gravUsers.sort((a, b) => b[1] - a[1]);
        const firstGrav = await getUser(guild, gravUsers[0][0]);
        if (firstGrav.user) {
            if (!firstGrav.roles.find(r => r.name === `Rank 1 Gravspeed - S${season}`)) firstGrav.addRole(roleGravFirst);
        }
        gravUsers.shift();
        for (var user of gravUsers) {
            const disUser = await getUser(guild, user[0]);
            if (!disUser.user) continue;
            if (disUser.roles.find(r => r.name === `Rank 1 Gravspeed - S${season}`)) {
                disUser.removeRole(roleGravFirst);
                break;
            }
        }
        for (var property in users) {
            const user = await getUser(guild, String(property));
            if (!user.user) continue;
            const roleStr = await getNewRole(users[property].points, season);
            if (!roleStr) {
                const userRole = await getCurRole(roles, user);
                if (userRole.size) {
                    await user.removeRole(userRole.find(r => {return true;}));
                }
                continue;
            }

            if (user.roles.find(r => r.name === roleStr)) continue;
            const userRole = await getCurRole(roles, user);
            if (userRole.size) await user.removeRole(userRole.find(r => {return true;}));
            var newRole = await roles.find(r => r.name === roleStr);
            await user.addRole(newRole);
        }
        console.log('\nRoleUpdate done\n');
    } catch (err) {
        console.log('An error occured in roleUpdate: '+err.message);
        console.log(err.stack);
    }
}

function getNewRole(points, season) {
    if (points < 300) return;
    if (points < 1000) return `Surfer - S${season}`;
    if (points < 2000) return `Super Surfer - S${season}`;
    if (points < 4000) return `Epic Surfer - S${season}`;
    if (points < 5500) return `Legendary Surfer - S${season}`;
    return `Mythic Surfer - S${season}`;
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
