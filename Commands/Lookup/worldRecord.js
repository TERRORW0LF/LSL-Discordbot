const { getSeasonOptions, getModeOptions, getMapOptions } = require('../../options');
const { getAllSubmits, getUserReaction, clearMsg } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching World Record, please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId),
              categoryOpts = getModeOptions(regexGroups[3], guildId),
              stageOpts = getMapOptions(regexGroups[4], guildId);
        if (!season || !categoryOpts.length || !stageOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
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
        const wr = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((a, b) => Number(a.time) - Number(b.time))[0];
        if (!wr) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No world record found.');
            return;
        }
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ **World Record found!**\n**User:** ${wr.name.split('#')[0]}\n**Time:** ${wr.time}\n**Submitted:** ${wr.date}\n${wr.proof}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in wr: ' + err.message);
        console.log(err.stack);
    }
}
