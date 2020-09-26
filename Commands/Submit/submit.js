const { google } = require('googleapis');
const axios = require('axios');

const { clearMsg, getUserReaction, getOptions } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing submission. Please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages),
              time = regexGroups[5],
              link = regexGroups[6];
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg, botMsg, seasonOpts);
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No season selected.');
            return;
        }
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg, botMsg, categoryOpts);
        if (!category) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No category selected.');
            return;
        }
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg, botMsg, stageOpts);
        if (!stage) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const submitUrl = getSubmitUrl(msg, season, category, stage, time, link);
        var resp = await axios.post(submitUrl);
        if (resp.status === 200) {
            clearMsg(botMsg, msg);
            msg.react('✅');
            botMsg.edit(`✅ New run submitted by ${msg.author}`);
        } else {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Failed to submit run.');
        }
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in submit: ' + err.message);
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
