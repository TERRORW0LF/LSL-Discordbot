const base = require('path').resolve('.');
const { getAllSubmits, getMapPoints, getPlacePoints, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const guildId = msg.guild.id,
              Cfg = serverCfg[guildId],
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        let place = parseInt(regexGroups[5]) < 0 ? parseInt(regexGroups[5]) : parseInt(regexGroups[5]-1);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit('❌ Incorrect season, mode or map.');
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit('⌛ No category selected.');
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit('⌛ No map selected.');
            
        const runsPreProc = (await getAllSubmits(Cfg.googleSheets.submit[season][category].id, Cfg.googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((runA, runB) => Number(runA.time) - Number(runB.time)),
              wrTime = Number(runsPreProc[0].time);
        let runs = [],
            placeRuns = [];
        for (let run of runsPreProc) {
            if (runs.some(value => value.name === run.name)) continue;
            else runs.push(run);
        }
        if (place < 0) place = runs.length+place;
        if (!runs[place]) place = runs.length-1;
        let rank;
        if (Cfg.tieOptions.stageTie) {
            placeRuns.push(...runs.filter(run => run.time === runs[place].time));
            rank = runs.filter(run => Number(run.time) < Number(runs[place].time)).length+1;
            if (!Cfg.tieOptions.stageFirstPlaceTie) {
                if (!place) {
                    placeRuns.length = 0;
                    placeRuns.push(runs[place]);
                    rank = place+1;
                }
                else if (runs[place].time === runs[0].time) {
                    placeRuns.length = 0;
                    placeRuns.push(...runs.filter(run => run.time === runs[place].time && run.name !== runs[0].name));
                    rank = 2;
                }
            }
        } else {
            placeRuns.push(runs[place]);
            rank = place+1;
            if (Cfg.tieOptions.stageFirstPlaceTie && runs[place].time === runs[0].time) {
                placeRuns.length = 0;
                placeRuns.push(...runs.filter(run => run.time === runs[place].time));
                rank = 1;
            }
        }
        const placeTime = Number(placeRuns[0].time);
        let normalizedTime;
        if ((normalizedTime = 1-((placeTime-wrTime)/wrTime)) < 0) normalizedTime = 0;
        const points = Math.round((0.4*Math.pow(normalizedTime, 25)+0.05*Math.pow(normalizedTime, 4)+0.25*Math.pow(normalizedTime, 3)+0.3*Math.pow(normalizedTime, 2))*100 + getMapPoints(stage, category) + getPlacePoints(rank));
        
        botMsg.edit(`✅ **Place found!**\n**Rank:** ${rank}\n**Time:** ${placeRuns[0].time}\n**Points:** ${points}\n**User/s:** ${placeRuns.map(run => run.name).join(', ')}\n${runs[place].proof}`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in place: ' + err.message);
        console.log(err.stack);
    }
}