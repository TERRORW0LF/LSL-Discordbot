const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');

module.exports = { clearMsg, getAllSubmits };

async function clearMsg(botMsg, msg) {
    for (let [key, value] of msg.reactions.cache) {
        if (value.me) value.remove();
    }
    for (let [key, value] of botMsg.reactions.cache) {
        if (value.me) value.remove();
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