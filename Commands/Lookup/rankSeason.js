const { getSeasonOptions } = require('../../options');
const { getPoints, clearMsg, getAllSubmits } = require("../../Util/misc");
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId);
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season.');
            return;
        }
        const user = msg.author.tag,
              pairs = await getPoints(serverCfg[guildId].googleSheets.points[season].Total.id, serverCfg[guildId].googleSheets.points[season].Total.range),
              pair = pairs.find(value => value.name === user);
        let runs = [],
            allSubmits = []
        for (let category of serverCfg[guildId].categories) {
            const submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range);
            submits.filter(submit => submit.name === user && submit.category === category).forEach(value => runs.push(value));
        }
        for (let run of runs) {
            if (runs.filter(value => value.stage === run.stage && value.category === run.category).length > 1) runs.splice(runs.indexOf(run), 1);
        }
        pairs.sort((a, b) => Number(b.points) - Number(a.points));
        const rank = pairs.indexOf(pair) !== -1 ? pairs.indexOf(pair) : 'undefined';
              length = runs.length,
              points = pair ? pair.points : 0;
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Season rank found!\n**Rank:** ${rank}\n**Points:** ${points}\n**Maps:** ${length}`);
    } catch(err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in rankSeason: ' + err.message);
        console.log(err.stack);
    }
}