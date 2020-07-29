const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const serverCfg = require('../Config/serverCfg.json');
const getUser = require('./getUser');
const { getPoints } = require('./misc');

module.exports = roleUpdate;

async function roleUpdate(guild, season) {
    try {
        const guildCfg = serverCfg[guild.id];
        if (guildCfg.roleOptions.role === "none") return;
        const allUsers = await guild.members.fetch(),
              sheets = google.sheets('v4'),
              token = await getGoogleAuth();
        let roles = guildCfg.roles;
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
                    firstPlace = ['', 0],
                    newFirstPlaces = new Map();
                for (let category of guildCfg.categories) {
                    // Get user/points pairs of current category.
                    const users = (await sheets.spreadsheets.values.get({
                        auth: token,
                        spreadsheetId: guildCfg.googleSheets.points[season][category].id,
                        range: guildCfg.googleSheets.points[season][category].range,
                        majorDimension: 'ROWS'
                    })).data.values;
                    // Give out first place roles if needed.
                    if (guildCfg.roleOptions.firstPlace) {
                        try {
                            if (guildCfg.roleOptions.firstPlaceRole === 'all') {
                                users.sort((a, b) => b[0] - a[0]);
                                firstPlace = [users[0][1], Number(users[0][0])];
                                const firstPlaceUser = allUsers.find(member => member.user.tag === firstPlace[0]);
                                if (firstPlaceUser && !firstPlaceUser.roles.cache.has(guildCfg.roles.firstPlace[season][category])) {
                                    firstPlaceUser.roles.add(guildCfg.roles.firstPlace[season][category]);
                                    newFirstPlaces.set(guildCfg.roles.firstPlace[season][category], firstPlaceUser.user.tag);
                                }
                            } else if (guildCfg.roleOptions.firstPlaceRole === 'highest') {
                                users.sort((a, b) => b[0] - a[0]);
                                if (firstPlace[1] < Number(users[0][0])) firstPlace = [users[0][1], Number(users[0][0])];
                            }
                        } catch (err) {
                            console.log('Failed to give first place role to user\n'+err);
                        }
                    }
                    // Set Map of users to their corresponding role.
                    for (let user in users) {
                        let highestPointsUser = highestPoints.get(user[1]);
                        if (highestPointsUser) {
                            if (highestPointsUser < Number(user[0])) highestPoints.set(user[1], Number(user[0]));
                        } else highestPoints.set(user[1], Number(user[0]));
                    }
                }
                // Give out first place role if needed.
                if (guildCfg.roleOptions.firstPlaceRole === 'highest') {
                    try {
                        const firstPlaceUser = allUsers.find(member => member.user.tag === firstPlace[0]);
                        if (firstPlaceUser && !firstPlaceUser.roles.cache.has(guildCfg.roles.firstPlace[season])) {
                            firstPlaceUser.roles.add(guildCfg.roles.firstPlace[season]);
                            newFirstPlaces.set(guildCfg.roles.firstPlace[season], firstPlaceUser.user.tag);
                        }
                    } catch (err) {
                        console.log(`Failed to give first place role to user\n`+err);
                    }
                }
                // loop over users and give corresponding role.
                for ([key, value] of highestPoints) {
                    try {
                        const guildmem = allUsers.find(member => member.user.tag === key),
                            role = getRole(roles, value);
                        for ([key, value] of newFirstPlaces) {
                            if (guildmem.roles.cache.has(key) && guildmem.user.tag !== value) guildmem.roles.remove(key);
                        }
                        if (!role) continue;
                        const currUserRoles = roles.keys().filter(key => guildmem.roles.cache.has(key) && key !== role);
                        for (role of currUserRoles) guildmem.roles.remove(role);
                        if (!guildmem.roles.cache.has(role)) guildmem.roles.add(role);
                    } catch (err) {
                        console.log(`Failed to give or remove role from user "${key}"\n`+err);
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
