'use strict';

const base = require('path').resolve('.');
const { createEmbed, getAllSubmits, getMapPoints, getPlacePoints, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const [ botMsg, videoMsg ] = await Promise.all([
        msg.channel.send(createEmbed('Searching personal best, please hold on.', 'Working', msg.guild.id)),
        msg.channel.send('.')
    ]);
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit(createEmbed('Incorrect season, mode or map.', 'Error', guildId)), videoMsg.delete();

        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId)), videoMsg.delete();

        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit(createEmbed('No map selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const runsPreProc = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => Number(runA.time) - Number(runB.time));
        if (!runsPreProc.length) return botMsg.edit(createEmbed('No submit found.', 'Error', msg.guild.id)), videoMsg.delete();
        const user = msg.author.tag,
              wrTime = Number(runsPreProc[0].time),
              pb = runsPreProc.find(run => run.name === user);
        if (!pb) return botMsg.edit(createEmbed('No personal best found.', 'Error', guildId)), videoMsg.delete();
            
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
        
        botMsg.edit(createEmbed(`**Personal Best**\nTime: *${pb.time}*\nRank: *${rank}*\nPoints: *${points}*\nSubmitted: *${pb.date}*`, 'Success', guildId));
        videoMsg.edit(pb.proof);
    } catch (err) {
        videoMsg.delete();
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in pb: ' + err.message);
        console.log(err.stack);
    }
}
