const { google } = require("googleapis");
const assert = require('assert').strict;

const { clearMsg, getUserReaction, getAllSubmits } = require("../../Util/misc");
const getSeasonOptions = require("../../Options/seasonOptions");
const getModeOptions = require('../../Options/modeOptions');
const getMapOptions = require('../../Options/mapOptions');
const { getGoogleAuth } = require("../../google-auth");

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]),
              mode = getModeOptions(regexGroups[3]),
              opts = getMapOptions(regexGroups[4]);
        if (!season || !mode || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const map = opts.length === 1 ? opts[0] : await getUserReaction(msg, botMsg, opts);
        if (!map) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        let runs;
        const sheet = process.env[`gSheetS${season.replace('season', '')}`],
              submits = await getAllSubmits(sheet, 'Record Log!A2:F');
        if (msg.member.roles.cache.has('574732901208424449') || msg.member.roles.cache.has('574523898784251908')) {
            runs = submits.filter(run => run.category === mode && run.stage === map);
        } else {
            runs = submits.filter(run => run.category === mode && run.stage === map && run.name === msg.author.tag);
        }
        if (!runs.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No run found.');
            return;
        }
        const run = runs.length === 1 ? runs[0] : await getUserReaction(msg, botMsg, runs.slice(-5).reverse()),
              row = submits.findIndex(value => { try {return !assert.deepStrictEqual(value, run);} catch(err) {return false}}),
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
        console.log('Error in deleteMap: ' + err.message);
        console.log(err.stack);
    }
}