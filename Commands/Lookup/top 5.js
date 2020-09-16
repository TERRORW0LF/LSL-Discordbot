const { getSeasonOptions, getCategoryOptions, getMapOptions } = require("../../options");
const { clearMsg } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching top 5 runs, please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2]),
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
        const runs = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((a, b) => Number(a.time) - Number(b.time));
        if (!runs.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No submits found.');
            return;
        }
        const top5 = runs.filter(run => Number(run.time) <= Number(runs[4].time));
        let outputStr = '';
        for (let run of runs) {
            outputStr += `\n${runs.filter(run2 => Number(run2.time) < Number(run.time)).length + 1}`;
            outputStr += ` ${run.name} - ${run.time} - ${run.proof}`;
        }
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Top 5 runs:${outputStr}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in top 5: ' + err.message);
        console.log(err.stack);
    }
}