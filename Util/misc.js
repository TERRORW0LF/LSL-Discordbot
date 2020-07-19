const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');

module.exports = { clearMsg, getAllSubmits };

async function clearMsg(botMsg, msg) {
    for (let reaction in msg.reactions.cache) {
        console.log('hey');
        if (reaction.me) reaction.remove();
    }
    for (let reaction in botMsg.reactions.cache) {
        if (reaction.me) reaction.remove();
    }
}

async function getAllSubmits(sheet, sheetrange) {
    const token = getGoogleAuth();
    const client = google.sheets('v4');
    const response = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheet,
        range: sheetrange,
        majorDimension: 'ROWS'
    })).data;
    let output = [];
    for (let row of response) {
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