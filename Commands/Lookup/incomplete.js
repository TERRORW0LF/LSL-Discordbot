const base = require('path').resolve('.');
const { getAllSubmits, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching map data, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories);
        if (!seasonOpts.length || !categoryOpts.length) return botMsg.edit('❌ Incorrect season or mode.');

        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');

        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg, botMsg, categoryOpts);
        if (!category) return botMsg.edit('⌛ No category selected.');

        let stageOptions = serverCfg[guildId].stages;
        const sheet = serverCfg[guildId].googleSheets.submit[season][category].id,
              submits = (await getAllSubmits(sheet, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(submit => submit.name === msg.author.tag),
              complete = stageOptions.filter(stage => submits.some(submit => submit.category === category && submit.stage === stage)),
              incomplete = stageOptions.filter(stage => !complete.some(stage2 => stage === stage2));
        if (!complete.length) return botMsg.edit('You have not completed any maps.');
        if (!incomplete.length) return botMsg.edit('You have completed every map.');

        botMsg.edit(`**Completed:**\n${complete.join(', ')}\n\n**Pending:**\n${incomplete.join(', ')}`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in incomplete: '+err.message);
        console.log(err.stack);
    }
}
