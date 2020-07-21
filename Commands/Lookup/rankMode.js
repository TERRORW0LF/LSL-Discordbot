const getSeasonOptions = require("../../Options/seasonOptions");
const getModeOptions = require('../../Options/modeOptions');
const { getPoints, clearMsg, getAllSubmits } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]),
              mode = getModeOptions(regexGroups[3]);
        if (!season || !mode) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season or mode.');
            return;
        }
        const user = msg.author.tag,
              username = msg.author.username,
              pair = (await getPoints(process.env[`gSheetS${season.replace('season', '')}`], `Points Sheet!${mode === 'Standard' ? 'A3:B' : 'D3:E'}`)).find(pair => pair.name === user),
              submits = await getAllSubmits(process.env[`gSheetS${season.replace('season', '')}`], 'Record Log!A2:F'),
              maps = submits.filter(submit => submit.name === user && submit.category === mode);
        let length;
        for (let map of maps) {
            if (maps.filter(value => value.stage === map.stage).length > 1) maps.splice(maps.indexOf(map), 1);
        }
        length = maps.length;
        const points = pair ? pair.points : 0;
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