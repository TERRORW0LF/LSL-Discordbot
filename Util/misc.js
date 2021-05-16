'use strict';

const base = require('path').resolve('.');
const { getGoogleAuth } = require('../google-auth');
const serverCfg = require(base+'/Config/serverCfg.json');
const { google } = require('googleapis');
const strComp = require('string-similarity');

const { getNumFromEmoji,  reactionFilter } = require('./reactionEmj');

module.exports = { createEmbed, getAllSubmits, getPoints, getMapPoints, getPlacePoints, getUserReaction,  getDecision, getOptions };

function createEmbed(text, func, guild) {
    let embedCfg = serverCfg?.[guild]?.embeds?.[func] ?? serverCfg.default.embeds?.[func];
    if (!embedCfg) embedCfg = serverCfg.default.embeds.Default;
    const color = embedCfg.color || 0,
          emoji = embedCfg.emoji || '';
    return {embed: {description: emoji+text, color: color}};
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
    if (d.bestMatch.rating >= max) return [options[d.bestMatchIndex]];
    for (let [index, rating] of d.ratings.entries()) {
        if (rating.rating <= min) continue;
        similars.push(options[index]);
    }
    return similars;
}

async function getUserReaction(user, botMsg, opts, header='**React to select the desired Option!**', timeout=20000) {
    try {
        botMsg.reactions.removeAll();
        let userChoice,
            page = 1,
            maxPage = Math.floor((opts.length- 1) / 5),
            pageLength;
        const fullOpts = ['◀','▶','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
        let reactOpts = [];
        await botMsg.react('◀');
        await botMsg.react('▶');
        do {
            userChoice && userChoice.first().emoji.name === '▶' ? page++ : page--;
            if (page > maxPage) page = 0;
            else if (page < 0) page = maxPage;
            pageLength = opts.slice(page*5, (page+1)*5).length;
            reactOpts = ['◀','▶'].push(...fullOpts.slice(2, 2+pageLength));
            botMsg.edit('', createEmbed(`${header}\n` + opts.slice(page*5, (page+1)*5).map((o, i) => `${reactOpts[i+2]} ${(typeof o === 'object' ? [...Object.values(o)].join(' ') : o)}`).join('\n'), 'Select', botMsg.guild.id));
            
            if (botMsg.reactions.cache.get('▶').users.cache.has(user.id))
                await botMsg.reactions.cache.get('▶').users.remove(user.id);
            if (botMsg.reactions.cache.get('◀').users.cache.has(user.id))
                await botMsg.reactions.cache.get('◀').users.remove(user.id);
            
            for (let i = 2; i < reactOpts.length; i++) {
                if (pageLength > i-2 && !botMsg.reactions.cache.has(reactOpts[i]))
                    botMsg.react(reactOpts[i]);
                else if (pageLength <= i-2 && botMsg.reactions.cache.has(reactOpts[i]))
                    botMsg.reactions.cache.get(reactOpts[i]).remove();
            }

            userChoice = await botMsg.awaitReactions(reactionFilter(reactOpts, {users:[user.id]}), {max: 1, time: timeout});
        } while (userChoice.first() && (userChoice.first().emoji.name === '▶' || userChoice.first().emoji.name === '◀'));
        botMsg.reactions.removeAll();
        if (!userChoice || !userChoice.first()) {
            //botMsg.edit('', createEmbed('No option selected.', 'Timeout', botMsg.guild.id));   
            return { index: undefined, option: undefined };
        }
        const index = getNumFromEmoji(userChoice.first().emoji.name) - 1 + page*5;
        const opt = opts[index];
        //botMsg.edit('', createEmbed(`Option *${opt}* selected.`, 'Success', botMsg.guild.id));
        return { option: opt, index };
    } catch (err) {
        botMsg.edit('', createEmbed('An error occurred while selecting an option.', 'Error', botMsg.guild.id));
        botMsg.reactions.removeAll();
        console.log('Error in getUserReaction: '+err.message);
        console.log(err.stack);
    }
}

async function getDecision(allowed={users, roles}, botMsg, decision, header='**React to make a decision!**', timeout=60000) {
    try {
        botMsg.reactions.removeAll();
        botMsg.edit('', createEmbed(`${header}\n` + decision, 'Select', botMsg.guild.id));
        await Promise.all([
            botMsg.react('✅'),
            botMsg.react('❌')
        ]);
        let userDecision;
        try {
            userDecision = await botMsg.awaitReactions(reactionFilter(['✅', '❌'], allowed), {max: 1, time: timeout, errors: ['time']});
        } catch (err) {
            botMsg.reactions.removeAll();
            botMsg.edit('', createEmbed('No decision made.', 'Timeout', botMsg.channel.guild.id));
            err.ignore = true;
            throw err;
        }
        botMsg.reactions.removeAll();
        if (userDecision.first().emoji.name === '✅') {
            botMsg.edit('', createEmbed(`Agreed to: *${decision}*`, 'Success', botMsg.guild.id));
            return true;
        }
        botMsg.edit('', createEmbed(`Rejected: *${decision}*`, 'Error', botMsg.guild.id));
        return false;
    } catch (err) {
        if (!err.ignore) {
            botMsg.edit('', createEmbed('An error occurred while making a decision.', 'Error', botMsg.guild.id));
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