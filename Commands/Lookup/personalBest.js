const getSeasonOptions = require('../../Options/seasonOptions');
const getModeOptions = require('../../Options/modeOptions');
const getMapOptions = require('../../Options/mapOptions');
const { clearMsg, getAllSubmits, getUserReaction } = require('../../Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]);
        const mode = getModeOptions(regexGroups[3]);
        const opts = getMapOptions(regexGroups[4]);
        if (!season || !mode || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map');
            return;
        }
        const map = opts.length === 1 ? opts[0] : await getUserReaction(msg, botMsg, opts);
        if (!map) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const user = msg.author.tag,
              runs = (await getAllSubmits(process.env[`gSheetS${season.replace('season', '')}`], 'Record Log!A2:F')).filter(run => run.category === mode && run.stage === map).sort((runA, runB) => runA.time - runB.time),
              pb = runs.filter(run => run.name === user)[0]
        if (!pb) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No personal best found.');
            return;
        }
        const rank = runs.indexOf(pb)+1;
        msg.react('✅');
        botMsg.edit(`✅ **Personal Best found!**\n**Time:** ${pb.time}\n**Rank:** ${rank}\n**Submitted:** ${pb.date}\n${pb.proof}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in pb: ' + err.message);
        console.log(err.stack);
    }
}
