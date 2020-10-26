const base = require('path').resolve('.');
const { getAllSubmits, getMapPoints, getPlacePoints, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit('❌ Incorrect season, mode or map.');

        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');

        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit('⌛ No category selected.');
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit('⌛ No map selected.');
            
        const runsPreProc = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => Number(runA.time) - Number(runB.time));
        if (!runsPreProc.length) return botMsg.edit('❌ No submit found.');
        const user = msg.author.tag,
              wrTime = Number(runsPreProc[0].time),
              pb = runsPreProc.find(run => run.name === user);
        if (!pb) return botMsg.edit('❌ No personal best found.');
            
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
              pbTime = Number(pb.time);
        let normalizedTime;
        if ((normalizedTime = 1-((pbTime-wrTime)/wrTime)) < 0) normalizedTime = 0;
        const points = Math.round((0.4*Math.pow(normalizedTime, 25)+0.05*Math.pow(normalizedTime, 4)+0.25*Math.pow(normalizedTime, 3)+0.3*Math.pow(normalizedTime, 2))*100 + getMapPoints(stage, category) + getPlacePoints(rank));
        
        botMsg.edit(`✅ **Personal Best found!**\n**Time:** ${pb.time}\n**Rank:** ${rank}\n**Points:** ${points}\n**Submitted:** ${pb.date}\n${pb.proof}`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in pb: ' + err.message);
        console.log(err.stack);
    }
}
