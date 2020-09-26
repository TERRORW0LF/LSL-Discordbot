const { clearMsg, getAllSubmits, getOptions } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching map data, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories);
        if (!seasonOpts.length || !categoryOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season or mode.');
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
        let stageOptions = serverCfg[guildId].stages;
        const sheet = serverCfg[guildId].googleSheets.submit[season][category].id,
              submits = (await getAllSubmits(sheet, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(submit => submit.name === msg.author.tag),
              complete = stageOptions.filter(stage => submits.some(submit => submit.category === category && submit.stage === stage)),
              incomplete = stageOptions.filter(stage => !complete.some(stage2 => stage === stage2));
        clearMsg(botMsg, msg);
        msg.react('✅');
        if (!complete.length) botMsg.edit('You have not completed any maps.');
        else if (!incomplete.length) botMsg.edit('You have completed every map.');
        else botMsg.edit(`**Completed:**\n${complete.join(', ')}\n\n**Pending:**\n${incomplete.join(', ')}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in incomplete: '+err.message);
        console.log(err.stack);
    }
}
