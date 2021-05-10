'use strict';

const { google } = require('googleapis');
const assert = require('assert').strict;

const base = require('path').resolve('.');
const { getGoogleAuth } = require(base+'/google-auth');
const { createEmbed, getAllSubmits, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Processing deletion, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              guildCfg = serverCfg[guildId],
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              link = regexGroups[3];
        if (!seasonOpts.length) return botMsg.edit(createEmbed('Incorrect season.', 'Error', guildId));
            
        const { option: season } = seasonOpts.length === 1 ? {option:seasonOpts[0]} : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId));
            
        let runs = [];
        for (let category of serverCfg[guildId].categories) {
            const submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range);
            let permissionCfg;
            permissionCfg = guildCfg?.permissions?.commands?.moderation?.["delete link"] ?? serverCfg.default.permissions?.commands?.moderation?.["delete link"];
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.commands?.moderation?.default ?? serverCfg.default.permissions?.commands?.moderation?.default;
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.commands?.default ?? serverCfg.default.permissions.commands.default;
            let hasPermission = false;
            if (permissionCfg.exclude)
                hasPermission = !permissionCfg.exclude.some(role => msg.member.roles.cache.has(role));
            if (permissionCfg.include)
                hasPermission = permissionCfg.include.some(role => msg.member.roles.cache.has(role));
            if (msg.member.hasPermission('ADMINISTRATOR'))
                hasPermission = true;
            if (hasPermission) {
                const submitFilter = submits.filter(run => run.proof === link && run.category === category);
                if (submitFilter.length) submitFilter.forEach(value => runs.push(value));
            }
            else {
                const submitFilter = submits.filter(run => run.proof === link && run.category === category && run.name === msg.author.tag);
                if (submitFilter.length) submitFilter.forEach(value => runs.push(value));
            }
        }
        if (!runs.length) return botMsg.edit(createEmbed('No run found.', 'Error', guildId));
            
        const { option: run } = runs.length === 1 ? {option:runs[0]} : await getUserReaction(msg.author, botMsg, runs.reverse());
        if (!run) return botMsg.edit(createEmbed('No run selected.', 'Timeout', guildId));
            
        const row = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][run.category].id, serverCfg[guildId].googleSheets.submit[season][run.category].range)).findIndex(value => { try {return !assert.deepStrictEqual(run, value);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              gid = serverCfg[guildId].googleSheets.submit[season][run.category].gid;
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
            spreadsheetId: serverCfg[guildId].googleSheets.submit[season][run.category].id,
            resource: resourceVals,
        }, async (err, res) => {
            if (err) return botMsg.edit(createEmbed('Failed to delete run.', 'Error', guildId));
            
            botMsg.edit(createEmbed('Sucessfully deleted run!', 'Success', guildId));
        });
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in deleteLink: ' + err.message);
        console.log(err.stack);
    }
}
