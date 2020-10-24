const { google } = require('googleapis');
const axios = require('axios');

const base = require('path').resolve('.');
const { getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Processing submission. Please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages),
              time = regexGroups[5],
              link = regexGroups[6];
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit('❌ Incorrect season, mode or map.');
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit('⌛ No category selected.');
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit('⌛ No map selected.');
            
        const submitUrl = getSubmitUrl(msg, season, category, stage, time, link);
        var resp = await axios.post(submitUrl);
        if (resp.status !== 200)
            return botMsg.edit('❌ Failed to submit run.');

        return botMsg.edit(`✅ New run submitted by ${msg.author}`);
    } catch (err) {
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
