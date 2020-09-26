const { getPoints, clearMsg, getAllSubmits, getOptions } = require("../../Util/misc");
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories);
        if (!seasonOpts.length || !categoryOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season or mode.');
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
        const user = msg.author.tag,
              pairs = await getPoints(serverCfg[guildId].googleSheets.points[season][category].id, serverCfg[guildId].googleSheets.points[season][category].range),
              pair = pairs.find(value => value.name === user),
              submits = await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range),
              runs = new Set([...submits.filter(submit => submit.name === user && submit.category === category).map(run => run.stage)]);
        pairs.sort((a, b) => Number(b.points) - Number(a.points));
        let rank;
        if (pair) {
            if (serverCfg[guildId].tieOptions.modeTie) {
                rank = pairs.filter(currPair => Number(currPair.points) > Number(pair.points)).length + 1;
            } else rank = pairs.indexOf(pair) + 1;
        } else rank = 'undefined';
        const length = runs.size,
              points = pair ? pair.points : 0;
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Mode rank found!\n**Rank:** ${rank}\n**Points:** ${points}\n**Maps:** ${length}`);
    } catch(err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in rankMode: ' + err.message);
        console.log(err.stack);
    }
}