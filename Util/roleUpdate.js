const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const serverCfg = require('../Config/serverCfg.json');
const getUser = require('./getUser');
const { getPoints } = require('./misc');

module.exports = roleUpdate;

async function roleUpdate(guild, season) {
    try {
        const guildCfg = serverCgf[guild.id];
        if (guildCfg.roleOptions.role === "none") return;
        const roles = GuildCfg.roles,
              allUsers = guild.members.fetch(),
              sheets = google.sheets('v4'),
              token = await getGoogleAuth();
        switch (guildCfg.roleOptions.role) {
            case "highestTotal": // One role --> highest total points out of all seasons.
                break;
            case "highestCategory": // One role --> highest category points out of all seasons.
                break;
            case "highestSeasonTotal": // One role per season --> highest total points of each season.
                break;
            case "highestSeasonCategory": // One role per season --> highest category points of each season.
                roles = roles[season];
                let highestPoints = new Map(),
                    firstPlace;
                for (let category of guildCfg.categories) {
                    const users = (await sheets.spreadsheets.values.get({
                        auth: token,
                        spreadsheetId: guildCfg.googleSheets.points[season][category].id,
                        range: guildCfg.googleSheets[season][category].range,
                        majorDimension: 'ROWS'
                    })).data.values;
                    if (guildCfg.roleOptions.firstPlace) {
                        // DO SOMETHING HERE I DON'T WANT TO RN
                    }
                    for (let user in users) {
                        let highestPointsUser = highestPoints.get(user[1]);
                        if (highestPointsUser) {
                            if (highestPointsUser < user[0]) highestPoints.set(user[1], user[0]);
                        } else highestPoints.set(user[1], user[0]);
                    }
                }
                for ([key, value] of highestPoints) {
                    const guildmem = allUsers.find(member => member.user.tag === key),
                          role = getRole(roles, value);
                    if (!role) continue;
                    try {
                        const currUserRoles = roles.keys().filter(key => guildmem.roles.cache.has(key) && key !== role);
                        for (role of currUserRoles) guildmem.roles.cache.remove(role);
                        if (!guildmem.roles.has(role)) guildmem.roles.add(role);
                    } catch {
                        console.log(`Failed to give role "${role}" to user "${key}"`);
                    }
                }
                break;
            case "allSeasonCategory": // One role per season per category.
                break;
            default:
                break;
        }
        console.log('\nRoleUpdate done\n');
    } catch (err) {
        console.log('An error occured in roleUpdate: '+err.message);
        console.log(err.stack);
    }
}


function getRole(roles, points) {
    let roleId,
        rolePoints = 0;
    for (let role in roles) {
        if (roles[role] <= points && roles[role] > rolePoints) {
            roleId = role;
            rolePoints = roles[role];
        }
    }
    return roleId;
}
