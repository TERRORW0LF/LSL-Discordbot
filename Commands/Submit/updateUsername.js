'use strict';

const base = require('path').resolve('.');
const { google } = require('googleapis');
const { getGoogleAuth } = require(base+'/google-auth');
const { createEmbed, getDecision } = require(base+'/Util/misc');
const roleUpdate = require(base+'/Util/roleUpdate');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching usernames.', 'Working', msg.guild.id));
    try {
        const OldName = regexGroups[3];
        const guildCfg = serverCfg[msg.guild.id] || serverCfg.default;
        let confirmationMsg;
        if (guildCfg.channels.moderation)
            confirmationMsg = await msg.guild.channels.cache.get(guildCfg.channels.moderation).send('.');
        else
            confirmationMsg = await msg.channel.send('.');

        let allowed;
        botMsg.edit(createEmbed('Requesting permission for your name change. This might take a while.', 'Working', msg.guild.id));
        try {
            let permissionCfg;
            permissionCfg = guildCfg?.permissions?.commands?.moderation?.["update username"] ?? serverCfg.default.permissions?.commands?.moderation?.["update username"];
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.commands?.moderation?.default ?? serverCfg.default.permissions?.commands?.moderation?.default;
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.commands?.default ?? serverCfg.default.permissions.commands.default;
            allowed = await getDecision({roles:permissionCfg.include}, confirmationMsg, `**${msg.member.displayName}** wants to update their name from **${OldName}** to **${msg.author.tag}**.`, '**Accept name change?**', 86400000);
        } catch (err) {
            botMsg.edit(createEmbed(`Your name change has not been confirmed.`, 'Error', msg.guild.id));
            console.log(err);
            return;
        }
        if (allowed) {
            botMsg.edit(createEmbed('Changing name.', 'Working', msg.guild.id));
            const token = await getGoogleAuth(),
                  sheetsClient = google.sheets('v4');
            let changedNames = 0,
                promiseArray = [];
            for (let season in guildCfg.googleSheets.submit) {
                const id = guildCfg.googleSheets.submit[season].Gravspeed.id,
                      range = 'Record Log!B2:B';
                const values = (await sheetsClient.spreadsheets.values.get({
                    auth: token,
                    spreadsheetId: id,
                    range,
                    majorDimension: 'COLUMNS'
                })).data.values;
                if (!values) continue;
                let updatedValues = [];
                updatedValues.push(values[0].map(name => name === OldName ? msg.author.tag : null));

                const updateResponse = (await sheetsClient.spreadsheets.values.update({
                    auth: token,
                    spreadsheetId: id,
                    range,
                    valueInputOption: 'RAW',
                    resource: {
                        majorDimension: 'COLUMNS',
                        values: updatedValues
                    }
                })).data;
                changedNames += updateResponse.updatedCells || 0;
                promiseArray.push(roleUpdate(msg.guild, season));
            }
            await Promise.all(promiseArray);
            botMsg.edit(createEmbed(`Name change complete. **${changedNames}** runs have been tranferred.`, 'Success', msg.guild.id));
            return;
        }
        botMsg.edit(createEmbed(`Your name change was rejected.`, 'Error', msg.guild.id));
    } catch (err) {
        botMsg.edit('', createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in updateUsername: ' + err.message);
        console.log(err.stack);
    }
}