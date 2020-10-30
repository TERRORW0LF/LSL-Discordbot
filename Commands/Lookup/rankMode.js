const base = require('path').resolve('.');
const { createEmbed, getUserReaction, getPoints, getAllSubmits, getOptions } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching submit data, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories);
        if (!seasonOpts.length || !categoryOpts.length) return botMsg.edit(createEmbed('Incorrect season or mode.', 'Error', guildId));
            
        const season = seasonOpts.length === 1 ? seasonOpts[0] : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId));
            
        const category = categoryOpts.length === 1 ? categoryOpts[0] : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId));
            
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

        botMsg.edit(createEmbed(`**Mode rank**\nRank: *${rank}*\nPoints: *${points}*\nMaps: *${length}*`, 'Success', guildId));
    } catch(err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in rankMode: ' + err.message);
        console.log(err.stack);
    }
}