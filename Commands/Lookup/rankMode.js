const { getSeasonOptions, getModeOptions } = require('../../options');
const { getPoints, clearMsg, getAllSubmits } = require("../../Util/misc");
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    try {
        const guildId = msg.guild.id;
              season = getSeasonOptions(regexGroups[2], guildId),
              category = getModeOptions(regexGroups[3], guildId);
        if (!season || !category.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season or mode.');
            return;
        }
        const user = msg.author.tag,
              username = msg.author.username,
              pair = (await getPoints(serverCfg[guildId].googleSheets.points[season][category].id, serverCfg[guildId].googleSheets.points[season][category].range)).find(pair => pair.name === user),
              submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range),
              runs = submits.filter(submit => submit.name === user && submit.category === category);
        let length;
        for (let run of runs) {
            if (runs.filter(value => value.stage === run.stage).length > 1) runs.splice(runs.indexOf(run), 1);
        }
        const length = runs.length,
              points = pair ? pair.points : 0;
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Mode rank found!\n**User:** ${username}\n**Points:** ${points}\n**Maps:** ${length}`);
    } catch(err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in rankMode: ' + err.message);
        console.log(err.stack);
    }
}