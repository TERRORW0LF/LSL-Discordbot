const { getGoogleAuth } = require('../google-auth'); 
const { google } = require('googleapis');
const serverCfg = require('../Config/serverCfg.json');
const getUser = require('./getUser');
const { getPoints } = require('./misc');

module.exports = roleUpdate;

async function roleUpdate(guild, season) {
    try {
        const roles = serverCfg[guild.id].roles,
              allUsers = guild.members.fetch(),
              requiredUsers = getPoints(process.env[`gSheetS${season}`], 'Point Sheet!')
        console.log('\nRoleUpdate done\n');
    } catch (err) {
        console.log('An error occured in roleUpdate: '+err.message);
        console.log(err.stack);
    }
}
