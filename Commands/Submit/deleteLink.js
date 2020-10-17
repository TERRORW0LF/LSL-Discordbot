const { google } = require('googleapis');
const assert = require('assert').strict;

const base = require('path').resolve('.');
const { getGoogleAuth } = require(base+'/google-auth');
const { getAllSubmits, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              link = regexGroups[3];
        if (!seasonOpts.length) return botMsg.edit('❌ Incorrect season.');
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');
            
        let runs = [];
        for (let category of serverCfg[guildId].categories) {
            const submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range);
            if (!serverCfg[guildId].permissions.moderation || serverCfg[guildId].permissions.moderation.some(value => msg.member.roles.cache.has(value))) {
                const submitFilter = submits.filter(run => run.proof === link && run.category === category);
                if (submitFilter.length) submitFilter.forEach(value => runs.push(value));
            } else {
                const submitFilter = submits.filter(run => run.proof === link && run.category === category && run.name === msg.author.tag);
                if (submitFilter.length) submitFilter.forEach(value => runs.push(value));
            }
        }
        if (!runs.length) return botMsg.edit('❌ No run found.');
            
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg, botMsg, runs.reverse());
        if (!run) return botMsg.edit('⌛ No run selected.');
            
        const row = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][run.category].id, serverCfg[guildId].googleSheets.submit[season][run.category].range)).findIndex(value => { try {return !assert.deepStrictEqual(run, value);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              gid = serverCfg[guildId].googleSheets.submit[season][run.category].gid;
        if (row === -1) return botMsg.edit('❌ Assert broke. Please blame assert and not my incompetence to find a more suitable package.');
            
        let requests = [];
        requests.push({
            deleteDimension: {
                range: {
                    sheetId: parseInt(gid),
                    dimension: 'ROWS',
                    startIndex: row + 1,
                    endIndex: row + 2,
                },
            },
        });
        requests.push({
            appendDimension: {
                sheetId: parseInt(gid),
                dimension: 'ROWS',
                length: 1,
            },
        });
        const resourceVals = {requests};
        await client.spreadsheets.batchUpdate({
            auth: token,
            spreadsheetId: serverCfg[guildId].googleSheets.submit[season][run.category].id,
            resource: resourceVals,
        }, async (err, res) => {
            if (err) return botMsg.edit('❌ Failed to delete run.');
            
            botMsg.edit('✅ Sucessfully deleted run!');
        });
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in deleteLink: ' + err.message);
        console.log(err.stack);
    }
}
