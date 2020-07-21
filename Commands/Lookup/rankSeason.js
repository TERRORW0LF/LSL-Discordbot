const getSeasonOptions = require("../../Options/seasonOptions");
const { getPoints, clearMsg, getAllSubmits } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    msg.react('💬');
    botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    try {
        const season = getSeasonOptions(regexGroups[2]),
              user = msg.author.tag,
              username = msg.author.username,
              pair = (await getPoints(process.env[`gSheetS${season.replace('season', '')}`], 'Points Sheet!G3:H')).find(pair => pair.name === user),
              submits = await getAllSubmits(process.env[`gSheetS${season.replace('season', '')}`], 'Record Log!A2:F'),
              maps = submits.filter((submit) => submit.name === user);
        let length;
        for (let map of maps) {
            if (maps.filter(value => value.stage === map.stage && value.category === map.category).length > 1) maps.splice(maps.indexOf(map), 1);
        }
        length = maps.length;
        if (!season) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect season.');
            return;
        }
        const points = pair ? pair.points : 0;
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Season rank found!\n**User:** ${user}\n**Points:** ${points}\n**Maps:** ${length}`);
    } catch(err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in rankSeason: ' + err.message);
        console.log(err.stack);
    }
}