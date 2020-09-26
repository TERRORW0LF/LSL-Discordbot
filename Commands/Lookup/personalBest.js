const { clearMsg, getAllSubmits, getMapPoints, getPlacePoints, getUserReaction, getOptions } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season, mode or map.');
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
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg, botMsg, stageOpts);
        if (!stage) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No map selected.');
            return;
        }
        const runsPreProc = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => Number(runA.time) - Number(runB.time)),
              user = msg.author.tag,
              pb = runsPreProc.find(run => run.name === user);
        if (!pb) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No personal best found.');
            return;
        }
        let runs = [],
            index;
        for (let run of runsPreProc) {
            if (runs.some(value => value[0] === run.name)) continue;
            else runs.push([run.name, run.time]);
        }
        if (serverCfg[guildId].tieOptions.stageTie) {
            index = runs.filter(run => Number(run[1]) < Number(pb.time)).length;
            if (!serverCfg[guildId].tieOptions.stageFirstPlaceTie) {
                if (runs[0][1] === pb.time) index = runs[0][0] === pb.name ? 0 : 1;
            }
        } else {
            index = runs.indexOf([pb.name, pb.time]);
            if (serverCfg[guildId].tieOptions.stageFirstPlaceTie) {
                if (runs[0][1] === pb.time) index = 0;
            }
        }
        const rank = index+1,
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
