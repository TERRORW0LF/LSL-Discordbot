const { getPbCache } = require('../Util/pbCache');
const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions');
const getMapOptions = require('../Options/mapOptions');

module.exports = handleRank;

let isRanking = false;

async function handleRank(message) {
    if (isRanking) return;
    isRanking = true;

    message.react('💬');
    const botMsg = await message.channel.send('💬 Searching map data, please hold on.');

    try {
        const messageVals = message.content.replace(/\?rank /i, '').split(',').map(i => i.trim());
        if (messageVals.length !== 3) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ To many or no enough Parameters! Type \'!help rank\' for an overview of the required parameters.');
            isRanking = false;
            return;
        }
        const season = await getSeasonOptions(messageVals[0]);
        if (season === undefined) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No season found for \'' + messageVals[0] + '\'.');
            isRanking = false;
            return;
        }
        const mode = await getModeOptions(messageVals[1]);
        if (mode === undefined) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No mode found for \'' + messageVals[1] + '\'.');
            isRanking = false;
            return;
        }
        const opts = await getMapOptions(messageVals[2]);
        var map;
        if (!opts.length) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No map found for \'' + messageVals[2] + '\'.');
            isRanking = false;
            return;
        } else {
            if (opts.length === 1) {
                map = opts[0];
            } else {
                map = await getUserReaction(message, botMsg, opts);
                if (!map) {
                    await message.clearReactions();
                    message.react('⌛');
                    botMsg.clearReactions();
                    botMsg.edit('⌛ Timeout while selecting map! No Rank requested.');
                    isRanking = false;
                    return;
                }
            }
        }
        const pbCache = await getPbCache();
        if (!pbCache[season][mode][map] || !pbCache[season][mode][map][message.author.tag]) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit(`❌ No run found for '${season} ${mode} ${map}'. Go and set a time!`);
            isRanking = false;
            return;
        }
        const time = pbCache[season][mode][map][message.author.tag].time;
        var timeArray = [];
        for (user in pbCache[season][mode][map]) {
            timeArray.push(pbCache[season][mode][map][user].time);
        }
        timeArray.sort((a, b) => {
            return Math.round(Number(a)*100) - Math.round(Number(b)*100);
        });
        const rank = timeArray.indexOf(time) + 1;
        await message.clearReactions();
        message.react('✅')
        botMsg.edit('✅ Rank found!');
        message.channel.send('', {
            embed: {
                title: `Map rank for ${message.author.username}`,
                url: `https://github.com/TERRORW0LF/LSL-Discordbot`,
                color: 3010349,
                author: {
                    name: 'LSL-discordbot',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                },
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${map.split(' ').join('%20')}.jpg`,
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
                    name: 'map',
                    value: `${map}`,
                    inline: true,
                },
                {
                    name: 'user',
                    value: `${message.author.username}`,
                    inline: true,
                },
                {
                    name: 'time',
                    value: `${time}`,
                    inline: true,
                },
                {
                    name: 'rank',
                    value: `${rank}`,
                    inline: true,
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'Rank requested',
                },
            }
        });
        isRanking = false;
    } catch (err) {
        await message.clearReactions();
        message.react('❌');
        botMsg.edit('❌ An error occured while handling your command. Informing staff.');
        console.log('Error in handleRank: '+err.message);
        console.log(err.stack);
        isRanking = false;
    }
}
