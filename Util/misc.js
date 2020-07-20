const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');

const { getEmojiFromNum, getNumFromEmoji, reactionFilter } = require('./reactionEmj');

module.exports = { clearMsg, getAllSubmits, getUserReaction };

async function clearMsg(botMsg, msg) {
    if (msg) {
        for (let [key, value] of msg.reactions.cache) {
            if (value.me) value.remove();
        }
    }
    if (botMsg) {
        for (let [key, value] of botMsg.reactions.cache) {
            if (value.me) value.remove();
        }
    }
}

async function getAllSubmits(sheet, sheetrange) {
    const token = await getGoogleAuth();
    const client = google.sheets('v4');
    const response = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheet,
        range: sheetrange,
        majorDimension: 'ROWS'
    })).data;
    let output = [];
    for (let row of response.values) {
        output.push({
            date: row[0],
            name: row[1],
            time: row[2],
            proof: row[3],
            stage: row[4],
            category: row[5]
        });
    }
    return output;
}

async function getUserReaction(msg, botMsg, opts) {
    const reactOpts = [];
    for (i = 1; i <= opts.length; i++) {
        const emoji = getEmojiFromNum(i);
        reactOpts.push(emoji);
        botMsg.react(emoji);
    }
    clearMsg(undefined, msg);
    msg.react('❔');
    botMsg.edit('❔ React to select the corresponding map!' + opts.map((o, i) => '```'+reactOpts[i]+' '+o+'```').join(''));
    const userChoice = await botMsg.awaitReactions(reactionFilter(reactOpts, msg.author.id), {max: 1, time: 15000});
    if (!userChoice || !userChoice.first()) return;
    const opt = getNumFromEmoji(userChoice.first().emoji.name);
    const map = opts[opt - 1];
    clearMsg(botMsg, msg);

    return map;
}