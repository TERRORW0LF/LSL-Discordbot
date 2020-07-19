const { getPbCache } = require('../../Util/pbCache');
const getSeasonOptions = require('../../Options/seasonOptions');
const getModeOptions = require('../../Options/modeOptions');
const clearMsg = require('../../Util/misc');

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
        // Make only one structure containing all submitted runs. Filter structure from there.
        // BUILD DATABASE BEFORE CONTINUING!
        // send maps. Use code field, picture modified with canvas, or stylized normal message.
        isIncompleting = false;
    } catch (err) {
        clearMsg(botMsg, msg);
        message.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in handleIncomplete: '+err.message);
        console.log(err.stack);
        isIncompleting = false;
    }
}
