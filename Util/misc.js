const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');
const strComp = require('string-similarity');

const { getEmojiFromNum, getNumFromEmoji,  reactionFilter } = require('./reactionEmj');

module.exports = { clearMsg, getAllSubmits, getPoints, getMapPoints, getPlacePoints, getUserReaction, getOptions };

async function clearMsg(botMsg, msg) {
    if (msg) msg.reactions.removeAll();
    if (botMsg) botMsg.reactions.removeAll();
}

async function getAllSubmits(sheet, sheetrange) {
    if (!sheet || !sheetrange) return [];
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
            category: row[5],
            stage: row[4],
            time: row[2],
            proof: row[3]
        });
    }
    return output;
}

function getOptions(input, opts, min = 0.35, max = 0.7) {
    const options = Array.from(opts),
          optionsLow = options.map(option => option.toLowerCase());
    let similars = [];
    const d = strComp.findBestMatch(input.toLowerCase(), optionsLow);
    for ([index, rating] of d.ratings.entries()) {
        if (rating.rating < min) continue;
        else if (rating.rating > max) return [options[index]];
        else similars.push(options[index]);
    }
    return similars;
}

async function getUserReaction(msg, botMsg, opts) {
    clearMsg(botMsg, msg);
    msg.react('❔');
    let userChoice,
        page = 0;
    const reactOpts = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','▶'];
    do {
        if (opts.slice((page-1)*5, page*5).length < 5) page = 0;
        page++;
        for (i = 0; i <= 4; i++) {
            if (i < opts.slice((page-1)*5, page*5).length && !msg.reactions.cache.find(reaction => reaction.emoji.name === reactOpts[i])) botMsg.react(reactOpts[i]);
            else if (msg.reactions.cache.find(reaction => reaction.emoji.name === reactOpts[i])) msg.reactions.find(reaction => reaction.emoji.name === reactOpts[i]).remove();
        }
        botMsg.react('▶');
        if (botMsg.reactions.cache.find(reaction => reaction.emoji.name === '▶') && botMsg.reactions.cache.find(reaction => reaction.emoji.name === '▶').users.cache.has(msg.author.id)) botMsg.reactions.cache.find(reaction => reaction.emoji.name === '▶').users.remove(msg.author.id);
        botMsg.edit('❔ React to select the desired Option!' + opts.slice((page-1)*5, page*5).map((o, i) => '```'+reactOpts[i]+' '+(typeof o === 'object' ? [...Object.values(o)].join(' ') : o)+'```').join(''));
        userChoice = await botMsg.awaitReactions(reactionFilter(reactOpts, msg.author.id), {max: 1, time: 15000});
    } while (userChoice.first() && userChoice.first().emoji.name === '▶');
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