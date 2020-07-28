const { google } = require('googleapis');
const axios = require('axios');

const { getSeasonOptions, getModeOptions, getMapOptions } = require('../../options');
const { clearMsg, getUserReaction } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing submission. Please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId),
              category = getModeOptions(regexGroups[3], guildId),
              opts = getMapOptions(regexGroups[4], guildId),
              time = regexGroups[5],
              link = regexGroups[6];
        if (!season || !category.length || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const stage = opts.length === 1 ? opts[0] : await getUserReaction(msg, botMsg, opts);
        if (!stage) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const submitUrl = getSubmitUrl(msg, season, mode, map, time, link);
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

function getSubmitUrl(msg, season, category, stage, time, proof) {
    let submiturl = '';
    const user = encodeURIComponent(msg.author.tag),
          submitCfg = serverCfg[msg.guild.id].googleForms[season][category];
    submiturl+= submitCfg.url;
    submiturl+=`&entry.${submitCfg.category}=${category}`;
    submiturl+=`&entry.${submitCfg.stage}=${stage}`;
    submiturl+=`&entry.${submitCfg.time}=${time}`;
    submiturl+=`&entry.${submitCfg.proof}=${proof}`;
    submiturl+=`&entry.${submitCfg.user}=${user}`;
    encodeURI(submiturl);
    return submiturl;
}
