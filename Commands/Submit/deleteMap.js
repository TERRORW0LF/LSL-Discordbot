const { google } = require("googleapis");
const assert = require('assert').strict;

const { clearMsg, getUserReaction, getAllSubmits, getOptions } = require("../../Util/misc");
const { getGoogleAuth } = require("../../google-auth");
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg, botMsg, seasonOpts);
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No season selected.');
            return;
        }
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg, botMsg, categoryOpts);
        if (!category) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No category selected.');
            return;
        }
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg, botMsg, stageOpts);
        if (!stage) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        let runs;
        const sheet = serverCfg[guildId].googleSheets.submit[season][category].id,
              submits = await getAllSubmits(sheet, serverCfg[guildId].googleSheets.submit[season][category].range);
        if (!serverCfg[guildId].permissions.moderation || serverCfg[guildId].permissions.moderation.some(value => msg.member.roles.cache.has(value))) {
            runs = submits.filter(run => run.category === category && run.stage === stage);
        } else {
            runs = submits.filter(run => run.category === category && run.stage === stage && run.name === msg.author.tag);
        }
        if (!runs.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No run found.');
            return;
        }
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg, botMsg, runs.reverse());
        if (!run) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No run selected.');
            return;
        }
        const row = submits.findIndex(value => { try {return !assert.deepStrictEqual(value, run);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              gid = serverCfg[guildId].googleSheets.submit[season][category].gid;
        if (row === -1) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Assert broke. Please blame assert and not my incompetence to find a more suitable package.');
            return;
        }
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
            if (err) {
                clearMsg(botMsg, msg);
                msg.react('❌');
                botMsg.edit('❌ Failed to delete run.');
                return;
            }
            clearMsg(botMsg, msg);
            msg.react('✅');
            botMsg.edit('✅ Sucessfully deleted run!');
        });
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in deleteMap: ' + err.message);
        console.log(err.stack);
    }
}