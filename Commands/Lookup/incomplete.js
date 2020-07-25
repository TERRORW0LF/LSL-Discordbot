const { getSeasonOptions, getModeOptions } = require('../../options');
const { clearMsg, getAllSubmits } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching map data, please hold on.');

    try {
        const guildId = msg.guild.id,
              season = getSeasonOptions(regexGroups[2], guildId),
              mode = getModeOptions(regexGroups[3], guildId);
        if (!season || !mode.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season or mode.');
            return;
        }
        let mapOptions = serverCfg[guildId].maps;
        const sheet = process.env[`gSheetS${season}`],
              submits = (await getAllSubmits(sheet, 'Record Log!A2:F')).filter(submit => submit.name === msg.author.tag),
              complete = mapOptions.filter(map => submits.some(submit => submit.stage === map)),
              incomplete = mapOptions.filter(map => !complete.some(map2 => map === map2));
        clearMsg(botMsg, msg);
        msg.react('✅');
        if (!complete) botMsg.edit('You have not completed any maps.');
        else if (!incomplete) botMsg.edit('You have completed every map.');
        else botMsg.edit(`**Completed:**\n${complete.join(', ')}\n\n**Pending:**\n${incomplete.join(', ')}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in incomplete: '+err.message);
        console.log(err.stack);
    }
}
