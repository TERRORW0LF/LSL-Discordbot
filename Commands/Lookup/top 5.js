const base = require('path').resolve('.');
const { getAllSubmits, getUserReaction, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching top 5 runs, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit('❌ Incorrect season, mode or map.');
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg, botMsg, seasonOpts);
        if (!season) return botMsg.edit('⌛ No season selected.');
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg, botMsg, categoryOpts);
        if (!category) return botMsg.edit('⌛ No category selected.');
            
        const stage = stageOpts.length === 1 ? stageOpts[0] : await getUserReaction(msg, botMsg, stageOpts);
        if (!stage) return botMsg.edit('⌛ No map selected.');
            
        const runsPreProc = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((a, b) => Number(a.time) - Number(b.time));
        if (!runsPreProc.length) return botMsg.edit('❌ No submits found.');
            
        let runs = [];
        for (let run of runsPreProc) {
            if (runs.some(value => value.name === run.name)) continue;
            else runs.push(run);
        }
        let outputStr = '```';
        if (!runs.length) outputStr = '\nNo runs found.';
        else {
            const top5 = runs.filter(run => Number(run.time) <= (runs[4] ? Number(runs[4].time) : Number(runs[runs.length - 1].time)));
            for (let run of top5) {
                outputStr += `\n${runs.filter(run2 => Number(run2.time) < Number(run.time)).length + 1}`;
                outputStr += ` ${run.name} - ${run.time} - ${run.proof}`;
            }
        }
        outputStr += '\n```';
        botMsg.edit(`✅ Top 5 runs:${outputStr}`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in top 5: ' + err.message);
        console.log(err.stack);
    }
}