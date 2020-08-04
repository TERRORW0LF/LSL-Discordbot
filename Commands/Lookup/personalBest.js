const { getSeasonOptions, getModeOptions, getMapOptions } = require('../../options');
const { clearMsg, getAllSubmits, getMapPoints, getPlacePoints, getUserReaction } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
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
        let runs = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => Number(runA.time) - Number(runB.time));
        const user = msg.author.tag,
              pb = runs.find(run => run.name === user);
        if (!pb) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No personal best found.');
            return;
        }
        runs = new Map([...runs.reverse().map(run => [run.name, run.time])]);
        runs = [...runs.entries()].reverse;
        const rank = runs.filter(run => Number(run[1]) < Number(pb.time)).length+1,
              points = Math.round(Math.pow((runs.length+1-rank)/runs.length, 2)*100 + getMapPoints(stage, category) + getPlacePoints(rank));
        clearMsg(botMsg, msg);
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
