const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const getUser = require('./getUser');

module.exports = roleUpdate;

let roleArray1 = ['Surfer - S1', 'Super Surfer - S1', 'Epic Surfer - S1', 'Legendary Surfer - S1', 'Mythic Surfer - S1'];
let roleArray2 = ['Surfer - S2', 'Super Surfer - S2', 'Epic Surfer - S2', 'Legendary Surfer - S2', 'Mythic Surfer - S2'];
let roleArray3 = ['Surfer - S3', 'Super Surfer - S3', 'Epic Surfer - S3', 'Legendary Surfer - S3', 'Mythic Surfer - S3'];
let roleArray4 = ['Surfer - S4', 'Super Surfer - S4', 'Epic Surfer - S4', 'Legendary Surfer - S4', 'Mythic Surfer - S4'];

async function roleUpdate(guild, season) {
    try {
        var roleArray;
        var sheetId;
        if (season == 'season1') {
            season = 1;
            roleArray = roleArray1;
            sheetId = process.env.gSheetS1;
        } else if (season == 'season2') {
            season = 2;
            roleArray = roleArray2;
            sheetId = process.env.gSheetS2;
        } else if (season == 'season3') {
            season = 3;
            roleArray = roleArray3;
            sheetId = process.env.gSheetS3;
        } else if (season == 'season4') {
            season = 4;
            roleArray = roleArray4;
            sheetId = process.env.gSheetS4;
        }
        else return;
        const rolesAll = await guild.roles;
        const roles = await rolesAll.filter(r => roleArray.includes(r.name));
        const roleStanFirst = await rolesAll.find(r => r.name === `Rank 1 Standard - S${season}`);
        const roleGravFirst = await rolesAll.find(r => r.name === `Rank 1 Gravspeed - S${season}`);
        var users = {};
        const token = await getGoogleAuth();
        const sheet = google.sheets('v4');
        const data = (await sheet.spreadsheets.values.get({
            auth: token,
            spreadsheetId: sheetId,
            range: 'Points Sheet!A3:E'
        })).data;
        const rows = await data.values;
        if (rows[0][1]) {
            if (!users[rows[0][1]]) users[rows[0][1]] = {};
            users[rows[0][1]].stan = true;
        }
        if (rows[0][4]) {
            if (!users[rows[0][4]]) users[rows[0][4]] = {}
            users[rows[0][4]].grav = true;
        }
        for (var i=0;i<rows.length;i++) {
            const row = rows[i];
            if (row[1]) {
                if (!users[row[1]]) users[row[1]] = {};
                if (!users[row[1]].points) users[row[1]].points = Number(row[0]);
                if (users[row[1]].points < Number(row[0])) users[row[1]].points = Number(row[0]);
            }
            if (row[4]) {
                if (!users[row[4]]) users[row[4]] = {};
                if (!users[row[4]].points) users[row[4]].points = Number(row[3]);
                if (users[row[4]].points < Number(row[3])) users[row[4]].points = Number(row[3]);
            }
        }
        var newStan = true, newGrav = true;
        for (var property in users) {
            try {
                const user = await getUser(guild, String(property));
                if (!user.user) continue;
                if (users[property].stan) {
                    if (!user.roles.find(r => r.name === `Rank 1 Standard - S${season}`)) user.addRole(roleStanFirst);
                    else newStan = false;
                } else if(newStan && user.roles.find(r => r.name === `Rank 1 Standard - S${season}`)) user.removeRole(roleStanFirst);
                if (users[property].grav) {
                    if (!user.roles.find(r => r.name === `Rank 1 Gravspeed - S${season}`)) user.addRole(roleGravFirst);
                    else newGrav = false;
                } else if(newGrav && user.roles.find(r => r.name === `Rank 1 Gravspeed - S${season}`)) user.removeRole(roleGravFirst);
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
            } catch (err) {
                console.log(`Role update failed for user: ${property}`);
            }
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
