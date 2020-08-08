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
        let runs = [];
        for (let category of serverCfg[guildId].categories) {
            const submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range);
            runs.push(...submits.filter(submit => submit.name === user && submit.category === category));
        }
        runs = new Set([...runs.map(run => run.stage)]);
        pairs.sort((a, b) => Number(b.points) - Number(a.points));
        let rank;
        if (pair) {
            if (serverCfg[guildId].tieOptions.seasonTie) {
                rank = pairs.filter(currPair => Number(currPair.points) > Number(pair.points)).length + 1;
            } else rank = pairs.indexOf(pair) + 1;
        } else rank = 'undefined';
        const length = runs.size,
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