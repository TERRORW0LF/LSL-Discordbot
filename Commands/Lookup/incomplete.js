const getSeasonOptions = require('../../Options/seasonOptions');
const getModeOptions = require('../../Options/modeOptions');
const { clearMsg, getAllSubmits } = require('../../Util/misc');

module.exports = run;

let mapOptions = ['Hanamura','Horizon Lunar Colony','Paris','Temple of Anubis','Volskaya Industries','Dorado','Havana','Junkertown','Rialto',
'Route 66','Gibraltar','Blizzard World','Eichenwalde','Hollywood',"King's Row",'Numbani', 'Busan Sanctuary','Busan MEKA Base',
'Busan Downtown','Ilios Well','Ilios Ruins','Ilios Lighthouse','Lijiang Night Market','Lijiang Garden','Lijiang Control Center',
'Nepal Village','Nepal Sanctum','Nepal Shrine','Oasis City Center','Oasis University','Oasis Gardens'];

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await mesg.channel.send('💬 Searching map data, please hold on.');

    try {
        const season = getSeasonOptions(regexGroups[1]),
              mode = getModeOptions(regexGroups[2]);
        if (!season || !mode) {
            clearMsg(botMsg, msg);
            botMsg.edit('❌ Incorrect season or mode.');
            return;
        }
        const sheet = process.env[`gSheetIdS${season.replace('season', '')}`],
              submits = (await getAllSubmits(sheet, 'Record Log!A2:F')).filter(submit => submit.name === msg.author.tag);
        // BUILD DATABASE BEFORE CONTINUING!
        const complete = mapOptions.filter(map => submits.some(submit => submit.stage === map)),
              incomplete = mapOptions.filter(map => !complete.some(map2 => map === map2));
        // send maps. Use code field, picture modified with canvas, or stylized normal message.
        clearMsg(botMsg, msg);
        msg.react('✅');
        if (!complete) botMsg.edit('You have not completed any maps.');
        else if (!incomplete) botMsg.edit('You have completed every map.');
        else botMsg.edit(`**Completed:**\n${complete.join(', ')}\n\n**Pending:**\n${incomplete.join(', ')}`);
    } catch (err) {
        clearMsg(botMsg, msg);
        message.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in handleIncomplete: '+err.message);
        console.log(err.stack);
    }
}
