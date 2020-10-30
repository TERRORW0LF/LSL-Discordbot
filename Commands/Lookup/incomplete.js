const base = require('path').resolve('.');
const { createEmbed, getUserReaction, getAllSubmits, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching submit data, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories);
        if (!seasonOpts.length || !categoryOpts.length) return botMsg.edit(createEmbed('Incorrect season or mode.', 'Error', guildId));

        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId));

        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId));

        let stageOptions = serverCfg[guildId].stages;
        const sheet = serverCfg[guildId].googleSheets.submit[season][category].id,
              submits = (await getAllSubmits(sheet, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(submit => submit.name === msg.author.tag),
              complete = stageOptions.filter(stage => submits.some(submit => submit.category === category && submit.stage === stage)),
              incomplete = stageOptions.filter(stage => !complete.some(stage2 => stage === stage2));
        if (!complete.length) return botMsg.edit(createEmbed('You have not completed any maps.', 'Success', guildId));
        if (!incomplete.length) return botMsg.edit(createEmbed('You have completed every map.', 'Success', guildId));

        botMsg.edit(createEmbed(`**Map status**\nCompleted:\n*${complete.join(', ')}*\n\nPending:\n*${incomplete.join(', ')}*`, 'Success', guildId));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in incomplete: '+err.message);
        console.log(err.stack);
    }
}
