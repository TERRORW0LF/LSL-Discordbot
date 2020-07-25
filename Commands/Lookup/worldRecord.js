const { getSeasonOptions, getModeOptions, getMapOptions } = require('../../options');
const { getAllSubmits, getUserReaction, clearMsg } = require('../../Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching World Record, please hold on.');
    try {
        const guildId = msg.guild.id;
              season = getSeasonOptions(regexGroups[2], guildId),
              mode = getModeOptions(regexGroups[3], guildId),
              opts = getMapOptions(regexGroups[4], guildId);
        if (!season || !mode.length || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const map = opts.length === 1 ? opts[0] : await getUserReaction(msg, botMsg, opts);
        if (!map) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const wr = (await getAllSubmits(process.env[`gSheetS${season}`], 'Record Log!A2:F')).filter(run => run.category === mode && run.stage === map).sort((a, b) => a -b)[0];
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
