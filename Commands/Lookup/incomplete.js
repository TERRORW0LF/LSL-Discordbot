const { getPbCache } = require('../../Util/pbCache');
const getSeasonOptions = require('../../Options/seasonOptions');
const getModeOptions = require('../../Options/modeOptions');

module.exports = run;

let mapOptions = ['Hanamura','Horizon Lunar Colony','Paris','Temple of Anubis','Volskaya Industries','Dorado','Havana','Junkertown','Rialto',
'Route 66','Gibraltar','Blizzard World','Eichenwalde','Hollywood',"King's Row",'Numbani', 'Busan Sanctuary','Busan MEKA Base',
'Busan Downtown','Ilios Well','Ilios Ruins','Ilios Lighthouse','Lijiang Night Market','Lijiang Garden','Lijiang Control Center',
'Nepal Village','Nepal Sanctum','Nepal Shrine','Oasis City Center','Oasis University','Oasis Gardens'];

let isIncompleting = false;

async function run(msg, client, regexGroups) {
    if (isIncompleting) return;
    isIncompleting = true;

    await msg.react('💬');
    const botMsg = await mesg.channel.send('💬 Searching map data, please hold on.');

    try {
        const season = regexGroups[1],
              mode = regexGroup[2];
        season = getSeasonOptions(season);
        mode = getModeOptions(mode);
        // Make a "clearReactions" function (accessible from everywhere)
        if (!season || !mode) {
            botMsg.edit('❌ Incorrect season or mode.');
            return;
        }
        // Build draft of database pbs.
        // BUILD DATABASE BEFORE CONTINUING!
        // send maps. Use code field, picture modified with canvas, or stylized normal message.
        isIncompleting = false;
    } catch (err) {
        (await message.reactions).forEach(async(key, value, map) => {
            if (!key.me) return;
            await key.remove();
        });
        message.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in handleIncomplete: '+err.message);
        console.log(err.stack);
        isIncompleting = false;
    }
}
