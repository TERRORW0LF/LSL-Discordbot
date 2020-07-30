const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');

const { getEmojiFromNum, getNumFromEmoji,  reactionFilter } = require('./reactionEmj');

module.exports = { clearMsg, getAllSubmits, getPoints, getMapPoints, getPlacePoints, getUserReaction };

async function clearMsg(botMsg, msg) {
    if (msg) msg.reactions.removeAll();
    if (botMsg) botMsg.reactions.removeAll();
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

function getMapPoints(map, mode) {
    let points;
    if (['Gibraltar', 'Havana', 'Rialto', 'Route66'].includes(map)) points = 80;
    else if (['Lijiang Control Center', 'Hollywood', 'Eichenwalde', 'Busan MEKA Base'].includes(map)) points = 70;
    else if (['Volskaya Industries', 'Paris', 'Numbani', 'Nepal Shrine', 'Nepal Sanctum', 'Lijiang Night Market', 'King\'s Row', 'Junktertown', 'Horizon Lunar Colony', 'Hanamura', 'Dorado'].includes(map)) points = 60;
    else if (['Temple of Anubis', 'Oasis University', 'Oasis City Center', 'Nepal Village', 'Lijiang Garden', 'Ilios Well', 'Illios Ruins', 'Illios Lighthouse', 'Busan Sanctuary', 'Busan Downtown', 'Blizzard World'].includes(map)) points = 50;
    else points = 40;
    return mode === 'Standard' ? points : points/2;
}

function getPlacePoints(place) {
    switch(place) {
        case 1: return 200;
        case 2: return 180;
        case 3: return 140;
        case 4: return 120;
        case 5: return 100;
        case 6: return 60;
        case 7: return 40;
        case 8: return 20;
        default: return 0;
    }
}

async function getPoints(sheet, sheetRange) {
    const token = await getGoogleAuth(),
        client = google.sheets('v4'),
        rows = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheet,
        range: sheetRange,
        majorDimension: 'ROWS'
    })).data.values;
    let output = [];
    for (let row of rows) {
        output.push({points: row[0], name: row[1]});
    }
    return output;
}