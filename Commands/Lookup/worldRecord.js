const base = require('path').resolve('.');
const { createEmbed, getAllSubmits, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');
const axios = require('axios');

module.exports = run;

async function run(msg, client, regexGroups) {
    const [ botMsg, videoMsg ] = await Promise.all([
        msg.channel.send(createEmbed('Searching world record, please hold on.', 'Working', msg.guild.id)),
        msg.channel.send('.')
    ]);
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit(createEmbed('Incorrect season, mode or map.', 'Error', guildId)), videoMsg.delete();
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit(createEmbed('No map selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const wr = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((a, b) => Number(a.time) - Number(b.time))[0];
        if (!wr) return botMsg.edit(createEmbed('No world record found.', 'Error', guildId)), videoMsg.delete();
        
        botMsg.edit(createEmbed(`**World Record**\nUser: *${wr.name.split('#')[0]}*\nTime: *${wr.time}*\nSubmitted: *${wr.date}*`, 'Success', guildId));
        videoMsg.edit(wr.proof);
    } catch (err) {
        videoMsg.delete();
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in wr: ' + err.message);
        console.log(err.stack);
    }
}
