const { google } = require("googleapis");
const assert = require('assert').strict;

const base = require('path').resolve('.');
const { createEmbed, getUserReaction, getAllSubmits, getOptions } = require(base+'/Util/misc');
const { getGoogleAuth } = require(base+'/google-auth');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Processing deletion, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit(createEmbed('Incorrect season, mode or map.', 'Error', guildId));
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId));
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId));
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit(createEmbed('No map selected.', 'Timeout', guildId));
            
        let runs;
        const sheet = serverCfg[guildId].googleSheets.submit[season][category].id,
              submits = await getAllSubmits(sheet, serverCfg[guildId].googleSheets.submit[season][category].range);
        if (!serverCfg[guildId].permissions.moderation || serverCfg[guildId].permissions.moderation.some(value => msg.member.roles.cache.has(value)))
            runs = submits.filter(run => run.category === category && run.stage === stage);
        else 
            runs = submits.filter(run => run.category === category && run.stage === stage && run.name === msg.author.tag);
        if (!runs.length) return botMsg.edit(createEmbed('No run found.', 'Error', guildId));
            
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg.author, botMsg, runs.reverse());
        if (!run) return botMsg.edit(createEmbed('No run selected.', 'Timeout', guildId));
            
        const row = submits.findIndex(value => { try {return !assert.deepStrictEqual(value, run);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              gid = serverCfg[guildId].googleSheets.submit[season][category].gid;
        if (row === -1) return botMsg.edit(createEmbed('Assert broke. Please blame assert and not my incompetence to find a more suitable package.', 'Error', guildId));
            
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
            spreadsheetId: sheet,
            resource: resourceVals,
        }, async (err, res) => {
            if (err) return botMsg.edit(createEmbed('Failed to delete run.', 'Error', guildId));
            
            botMsg.edit(createEmbed('Sucessfully deleted run!', 'Success', guildId));
        });
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in deleteMap: ' + err.message);
        console.log(err.stack);
    }
}