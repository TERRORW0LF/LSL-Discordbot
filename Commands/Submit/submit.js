const { google } = require('googleapis');
const axios = require('axios');

const getSeasonOptions = require('../../Options/seasonOptions');
const getModeOptions = require('../../Options/modeOptions');
const getMapOptions = require('../../Options/mapOptions');
const { clearMsg, getUserReaction } = require('../../Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing submission. Please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]),
              mode = getModeOptions(regexGroups[3]),
              opts = getMapOptions(regexGroups[4]),
              time = regexGroups[5],
              link = regexGroups[6];
        if (!season || !mode || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const map = opts.length === 1 ? opts[0].map : await getUserReaction(msg, botMsg, opts);
        if (!map) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const submitUrl = await getSubmitUrl(msg, season, mode, map, time, link);
        var resp = await axios.post(submitUrl);
        if (resp.status === 200) {
            clearMsg(botMsg, msg);
            msg.react('✅');
            botMsg.edit(`✅ New run submitted by ${message.author}`);
        } else {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Failed to submit run.');
        }
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in handleSubmission: ' + err.message);
        console.log(err.stack);
    }
}

function getSubmitUrl(msg, season, mode, map, time, link) {
    var submiturl = '';
    var user = encodeURIComponent(msg.author.tag);
    submiturl+= process.env[`gFormS${season.replace('season', '')}`];
    submiturl+=`&entry.${process.env.gFormMODE}=${mode}`;
    submiturl+=`&entry.${process.env.gFormMAP}=${map}`;
    submiturl+=`&entry.${process.env.gFormTIME}=${time}`;
    submiturl+=`&entry.${process.env.gFormLINK}=${link}`;
    submiturl+=`&entry.${process.env.gFormUSER}=${user}`;
    encodeURI(submiturl);
    return submiturl;
}
