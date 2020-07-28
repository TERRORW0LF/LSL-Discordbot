const { getSeasonOptions, getModeOptions, getMapOptions } = require('../../options');
const { clearMsg, getAllSubmits, getMapPoints, getUserReaction } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId),
              category = getModeOptions(regexGroups[3], guildId),
              opts = getMapOptions(regexGroups[4], guildId);
        if (!season || !category.length || !opts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
            return;
        }
        const stage = opts.length === 1 ? opts[0] : await getUserReaction(msg, botMsg, opts);
        if (!stage) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        let runs = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => runA.time - runB.time);
        const user = msg.author.tag,
              pb = runs.filter(run => run.name === user)[0];
        for (let run of runs) {
            if (runs.filter(run2 => run2.name === run.name).length > 1) runs.splice(runs.indexOf(run), 1);
        }
        if (!pb) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No personal best found.');
            return;
        }
        const rank = runs.indexOf(pb)+1,
              points = Math.round((runs.length/rank - 1)^2*getMapPoints(map, mode));
        msg.react('✅');
        botMsg.edit(`✅ **Personal Best found!**\n**Time:** ${pb.time}\n**Rank:** ${rank}\n**Points:** ${points}\n**Submitted:** ${pb.date}\n${pb.proof}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in pb: ' + err.message);
        console.log(err.stack);
    }
}
