const { getPbCache } = require('../Util/pbCache');
const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions'); 

module.exports = handleIncomplete;

let mapOptions = ['Hanamura','Horizon Lunar Colony','Paris','Temple of Anubis','Volskaya Industries','Dorado','Havana','Junkertown','Rialto',
'Route 66','Gibraltar','Blizzard World','Eichenwalde','Hollywood',"King's Row",'Numbani', 'Busan Sanctuary','Busan MEKA Base',
'Busan Downtown','Ilios Well','Ilios Ruins','Ilios Lighthouse','Lijiang Night Market','Lijiang Garden','Lijiang Control Center',
'Nepal Village','Nepal Sanctum','Nepal Shrine','Oasis City Center','Oasis University','Oasis Gardens'];

let isIncompleting = false;

async function handleIncomplete(message) {
    if (isIncompleting) return;
    isIncompleting = true;

    message.react('💬');
    const botMsg = await message.channel.send('💬 Searching map data, please hold on.');

    try {
        const messageVals = message.content.replace(/!incomplete /i, '').split(',').map(i => i.trim());
        if (messageVals.length !== 2) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ To many or not enough parameters! Type \'!help incomplete\' for an overview of the required parameters.');
            isIncompleting = false;
            return;
        }
        const season = getSeasonOptions(messageVals[0]);
        if (!season) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No season found for \'' + messageVals[0] + '\'.');
            isIncompleting = false;
            return;
        }
        const mode = getModeOptions(messageVals[1]);
        if (!mode) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No mode found for \'' + messageVals[1] + '\'.');
            isIncompleting = false;
            return;
        }
        const pbCache = await getPbCache();
        var incomplete = [];
        var complete = [];
        for (var map of mapOptions) !pbCache[season][mode][map] || !pbCache[season][mode][map][message.author.tag] ? incomplete.push(map) : complete.push(map);
        var completeStr  = '';
        var incompleteStr = '';
        for (var map of complete) completeStr += map + '\n';
        for (var map of incomplete) incompleteStr += map + '\n';
        if (!completeStr.length) completeStr = 'No Maps';
        await message.clearReactions();
        message.react('✅');
        botMsg.edit('✅ Map data collected!');
        if (!incompleteStr.length) {
            message.channel.send('', {
                embed: {
                    title: `Map status for ${message.author.username}`,
                    url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                    color: 3010349,
                    author: {
                        name: 'LSL-discordbot',
                        icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                    },
                    description: 'You have completed every map! Go and get those World Records!',
                    timestamp: new Date(),
                    footer: {
                        icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        text: 'Incomplete requested',
                    },
                }
            });
            isIncompleting = false;
            return;
        }
        message.channel.send('', {
            embed: {
                title: `Map status for ${message.author.username}`,
                url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                color: 3010349,
                author: {
                    name: 'LSL-discordbot',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                },
                fields: [{
                    name: 'season',
                    value: `${season.replace('season', 'season ')}`,
                    inline: true,
                },
                {
                    name: 'mode',
                    value: `${mode}`,
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true,
                },
                {
                    name: 'completed',
                    value: `${completeStr}`,
                    inline: true,
                },
                {
                    name: 'not completed',
                    value: `${incompleteStr}`,
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true,
                },],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'Incomplete requested',
                },
            }
        });
        isIncompleting = false;
    } catch (err) {
        await message.clearReactions();
        message.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in handleIncomplete: '+err.message);
        console.log(err.stack);
        isIncompleting = false;
    }
}
