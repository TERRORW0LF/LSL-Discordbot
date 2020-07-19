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
