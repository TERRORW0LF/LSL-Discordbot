'use strict';

const axios = require('axios');

const base = require('path').resolve('.');
const { createEmbed, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Processing submission, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages),
              time = regexGroups[5],
              link = regexGroups[6];
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit(createEmbed('Incorrect season, mode or map.', 'Error', guildId));
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId));
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId));
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit(createEmbed('No map selected.', 'Timeout', guildId));
            
        const submitUrl = getSubmitUrl(msg, season, category, stage, time, link);
        var resp = await axios.post(submitUrl);
        if (resp.status !== 200)
            return botMsg.edit(createEmbed('Failed to submit run.', 'Error', guildId));

        return botMsg.edit(createEmbed(`New run submitted by **${msg.member.nickname || msg.author.username}**`, 'Success', guildId));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in submit: ' + err.message);
        console.log(err.stack);
    }
}

function getSubmitUrl(msg, season, category, stage, time, proof) {
    let submiturl = '';
    const user = msg.author.tag,
          submitCfg = serverCfg[msg.guild.id].googleForms[season][category];
    submiturl+= submitCfg.url;
    submiturl+=`&entry.${encodeURIComponent(submitCfg.category)}=${encodeURIComponent(category)}`;
    submiturl+=`&entry.${encodeURIComponent(submitCfg.stage)}=${encodeURIComponent(stage)}`;
    submiturl+=`&entry.${encodeURIComponent(submitCfg.time)}=${encodeURIComponent(time)}`;
    submiturl+=`&entry.${encodeURIComponent(submitCfg.proof)}=${encodeURIComponent(proof)}`;
    submiturl+=`&entry.${encodeURIComponent(submitCfg.user)}=${encodeURIComponent(user)}`;
    submiturl = encodeURI(submiturl);
    return submiturl;
}
