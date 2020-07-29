const { google } = require('googleapis');
const assert = require('assert').strict;

const { getGoogleAuth } = require('../../google-auth');
const { getSeasonOptions } = require('../../options');
const { clearMsg, getAllSubmits, getUserReaction } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId),
              link = regexGroups[3];
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season.');
            return;
        }
        let runs = [];
        for (let category of serverCfg[guildId].categories) {
            const submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range);
            if (!serverCfg[guildId].permissions.moderation || serverCfg[guildId].permissions.moderation.some(value => msg.member.roles.cache.has(value))) {
                runs.push(submits.filter(run => run.proof === link && run.category === category));
            } else {
                runs.push(submits.filter(run => run.proof === link && run.category === category && run.name === msg.author.tag));
            }
        }
        console.log(runs);
        if (!runs.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No run found.');
            return;
        }
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg, botMsg, runs.slice(-5).reverse()),
              row = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][run.category].id, serverCfg[guildId].googleSheets.submit[season][run.category].range)).findIndex(value => { try {return !assert.deepStrictEqual(run, value);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              gid = serverCfg[guildId].googleSheets.submit[season][run.category].gid;
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
            spreadsheetId: serverCfg[guildId].googleSheets.submit[season][run.category].id,
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
        clearMsg(botMsg, msg)
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in deleteLink: ' + err.message);
        console.log(err.stack);
    }
}
