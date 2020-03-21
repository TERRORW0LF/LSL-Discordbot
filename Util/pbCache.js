const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const { getGoogleAuth } = require('../google-auth');

module.exports = { getPbCache, setPbCache, updatePbCache };

let cache;
// Structure [season][mode][map][user][user, time, link, date]
function getPbCache() {
    return cache;
}

async function setPbCache() {
    const token = await getGoogleAuth();
    const sheets = google.sheets('v4');
    const struc = {
        season1: {
            Gravspeed: {},
            Standard: {}
        },
        season2: {
            Gravspeed: {},
            Standard: {}
        },
        season3: {
            Gravspeed: {},
            Standard: {}
        }
    };
    const gravs1 = struc.season1.Gravspeed;
    const stans1 = struc.season1.Standard;
    const gravs2 = struc.season2.Gravspeed;
    const stans2 = struc.season2.Standard;
    const gravs3 = struc.season3.Gravspeed;
    const stans3 = struc.season3.Standard;
    try {
        const response1 = (await sheets.spreadsheets.values.get({
            auth: token,
            spreadsheetId: process.env.gSheetS1,
            range: 'PB Times!A4:K'
        })).data;
        const rows1 = await response1.values;
        const response2 = (await sheets.spreadsheets.values.get({
            auth: token,
            spreadsheetId: process.env.gSheetS2,
            range: 'PB Times!A4:K'
        })).data;
        const rows2 = await response2.values;
        const response3 = (await sheets.spreadsheets.values.get({
            auth: token,
            spreadsheetId: process.env.gSheetS3,
            range: 'PB Times!A4:K'
        })).data;
        const rows3 = await response3.values;
        for (i=0; i < rows1.length; i++) {
            const row = rows1[i];
            if (row[8] !== '' && row[8] !== undefined) {
                if (!gravs1[row[7]]) gravs1[row[7]] = {};
                if (!gravs1[row[7]][row[6]]) gravs1[row[7]][row[6]] = {};
                gravs1[row[7]][row[6]].user = row[6];
                gravs1[row[7]][row[6]].time = row[8];
                gravs1[row[7]][row[6]].link = row[10];
                gravs1[row[7]][row[6]].date = row[9].split(' ')[0];
            }
            if (row[2] !== '') {
                if (!stans1[row[1]]) stans1[row[1]] = {};
                if (!stans1[row[1]][row[0]]) stans1[row[1]][row[0]] = {};
                stans1[row[1]][row[0]].user = row[0];
                stans1[row[1]][row[0]].time = row[2];
                stans1[row[1]][row[0]].link = row[4];
                stans1[row[1]][row[0]].date = row[3].split(' ')[0];
            }
        }
        for (i=0; i < rows2.length; i++) {
            const row = rows2[i];
            if (row[8] !== '' && row[8] !== undefined) {
                if (!gravs2[row[7]]) gravs2[row[7]] = {};
                if (!gravs2[row[7]][row[6]]) gravs2[row[7]][row[6]] = {};
                gravs2[row[7]][row[6]].user = row[6];
                gravs2[row[7]][row[6]].time = row[8];
                gravs2[row[7]][row[6]].link = row[10];
                gravs2[row[7]][row[6]].date = row[9].split(' ')[0];
            }
            if (row[2] !== '') {
                if (!stans2[row[1]]) stans2[row[1]] = {};
                if (!stans2[row[1]][row[0]]) stans2[row[1]][row[0]] = {};
                stans2[row[1]][row[0]].user = row[0];
                stans2[row[1]][row[0]].time = row[2];
                stans2[row[1]][row[0]].link = row[4];
                stans2[row[1]][row[0]].date = row[3].split(' ')[0];
            }
        }
        for (i=0; i < rows3.length; i++) {
            const row = rows3[i];
            if (row[8] !== '' && row[8] !== undefined) {
                if (!gravs3[row[7]]) gravs3[row[7]] = {};
                if (!gravs3[row[7]][row[6]]) gravs3[row[7]][row[6]] = {};
                gravs3[row[7]][row[6]].user = row[6];
                gravs3[row[7]][row[6]].time = row[8];
                gravs3[row[7]][row[6]].link = row[10];
                gravs3[row[7]][row[6]].date = row[9].split(' ')[0];
            }
            if (row[2] !== '') {
                if (!stans3[row[1]]) stans3[row[1]] = {};
                if (!stans3[row[1]][row[0]]) stans3[row[1]][row[0]] = {};
                stans3[row[1]][row[0]].user = row[0];
                stans3[row[1]][row[0]].time = row[2];
                stans3[row[1]][row[0]].link = row[4];
                stans3[row[1]][row[0]].date = row[3].split(' ')[0];
            }
        }
        cache = await struc;
    } catch (err) {
        console.log('An error occurred in pbCache[setpbCache]: ' + err.message);
        console.log(err.stack);
    }
}

function updatePbCache(data) {
    var map = cache[data.season][data.mode][data.map];
    if (!map) map = {};
    if (!map[data.user]) map[data.user] = {};
    map[data.user].user = data.user;
    map[data.user].time = data.time;
    map[data.user].link = data.link;
    map[data.user].date = data.date;
}
