const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');
const strComp = require('string-similarity');

const { getNumFromEmoji,  reactionFilter } = require('./reactionEmj');

module.exports = { getAllSubmits, getPoints, getMapPoints, getPlacePoints, getUserReaction,  getUserDecision, getOptions };

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
    if (d.bestMatch.rating >= max) return [options[d.bestMatchIndex]];
    for ([index, rating] of d.ratings.entries()) {
        if (rating.rating <= min) continue;
        similars.push(options[index]);
    }
    return similars;
}

async function getUserReaction(user, botMsg, opts, timeout=20000) {
    try {
        botMsg.reactions.removeAll();
        let userChoice,
            page = -1,
            maxPage = Math.floor((opts.length- 1) / 5),
            pageLength;
        const reactOpts = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','▶'];
        do {
            page++;
            pageLength = opts.slice(page*5, (page+1)*5).length;
            if (page > maxPage) page = 0;
            let newNextPage = false;
            for (i = 0; i <= 4; i++) {
                if (pageLength > i && !botMsg.reactions.cache.has(reactOpts[i])) {
                    botMsg.react(reactOpts[i]);
                    newNextPage = true;
                }
                else if (pageLength <= i && botMsg.reactions.cache.has(reactOpts[i]))
                    botMsg.reactions.cache.get(reactOpts[i]).remove();
            }
            if (newNextPage) {
                if (botMsg.reactions.cache.has('▶')) botMsg.reactions.cache.get('▶').remove();
                await botMsg.react('▶');
            }
            if (botMsg.reactions.cache.get('▶').users.cache.has(user.id))
                await botMsg.reactions.cache.get('▶').users.remove(user.id);
            botMsg.edit('❔ React to select the desired Option!' + opts.slice(page*5, (page+1)*5).map((o, i) => '```'+reactOpts[i]+' '+(typeof o === 'object' ? [...Object.values(o)].join(' ') : o)+'```').join(''));
            userChoice = await botMsg.awaitReactions(reactionFilter(reactOpts, user.id), {max: 1, time: timeout});
        } while (userChoice.first() && userChoice.first().emoji.name === '▶');
        botMsg.reactions.removeAll();
        if (!userChoice || !userChoice.first()) return;
        const index = getNumFromEmoji(userChoice.first().emoji.name) - 1;
        const opt = opts[index];
        return opt;
    } catch (err) {
        botMsg.reactions.removeAll();
        console.log('Error in getUserReaction: '+err.message);
        console.log(err.stack);
    }
}

async function getUserDecision(user, botMsg, decision, timeout=60000) {
    try {
        botMsg.reactions.removeAll();
        botMsg.edit('❔ React to made a decision!', {embed: {description: decision, color: 3010349}});
        await Promise.all([
            botMsg.react('✅'),
            botMsg.react('❌')
        ]);
        try {
            userDecision = await botMsg.awaitReactions(reactionFilter(['✅', '❌'], user.id), {max: 1, time: timeout, errors: ['time']});
        } catch (err) {
            err.ignore = true;
            throw err;
        }
        botMsg.edit(botMsg.content, {embed: null});
        botMsg.reactions.removeAll();
        if (userDecision.first().emoji.name === '✅') return true;
        return false;
    } catch (err) {
        botMsg.edit(botMsg.content, {embed: null});
        botMsg.reactions.removeAll();
        if (!err.ignore) {
            console.log('Error in getUserDecision: '+err.message);
            console.log(err.stack);
        }
        throw err;
    }
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