const { google } = require('googleapis');
const assert = require('assert').strict;

const { getGoogleAuth } = require('../../google-auth');
const getSeasonOptions = require('../../Options/seasonOptions');
const { clearMsg, getAllSubmits, getUserReaction } = require('../../Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]),
              link = regexGroups[3];
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season.');
            return;
        }
        let runs;
        const sheet = process.env[`gSheetS${season.replace('season', '')}`],
              submits = await getAllSubmits(sheet, 'Record Log!A2:F');
        if (msg.member.roles.cache.has('574732901208424449') || msg.member.roles.cache.has('574523898784251908')) {
            runs = submits.filter(run => run.proof === link);
        } else {
            runs = submits.filter(run => run.proof === link && run.name === msg.author.tag);
        }
        if (!runs.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No run found.');
            return;
        }
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg, botMsg, runs.slice(-5).reverse()),
              row = submits.findIndex(value => { try {return !assert.deepStrictEqual(run, value);} catch(err) {return false}}),
              client = google.sheets('v4'),
              token = await getGoogleAuth(),
              sid = process.env.gSheetLOGID;
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
                    sheetId: parseInt(sid),
                    dimension: 'ROWS',
                    startIndex: row + 1,
                    endIndex: row + 2,
                },
            },
        });
        requests.push({
            appendDimension: {
                sheetId: parseInt(sid),
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
        clearMsg(botMsg, msg)
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in deleteLink: ' + err.message);
        console.log(err.stack);
    }
}
