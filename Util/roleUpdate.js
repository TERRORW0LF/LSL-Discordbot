const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const serverCfg = require('../Config/serverCfg.json');
const getUser = require('./getUser');
const { getPoints } = require('./misc');

module.exports = roleUpdate;

async function roleUpdate(guild, season) {
    try {
        if (serverCfg[guild.id].roleOptions.role === "none") return;
        const roles = serverCfg[guild.id].roles,
              allUsers = guild.members.fetch();
        switch (serverCfg[guild.id].roleOptions.role) {
            case "highestTotal": // One role --> highest total points out of all seasons.
                break;
            case "highestCategory": // One role --> highest category points out of all seasons.
                break;
            case "highestSeasonTotal": // One role per season --> highest total points of each season.
                break;
            case "highestSeasonCategory": // One role per season --> highest category points of each season.
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
