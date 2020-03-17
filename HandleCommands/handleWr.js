const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions');
const getMapOptions = require('../Options/mapOptions');
const getUserReaction = require('../Util/UserReaction');
const { getWrCache } = require('../Util/wrCache');

module.exports = handleWr;

let isWring = false;

async function handleWr (message) {
    if (isWring) return;
    isWring = true;
    
    message.react('💬');
    const botMsg = await message.channel.send('💬 Searching World Record, please hold on.');
    try {
        const messageVals = await message.content.replace(/\?wr /i, '').split(',').map(i => i.trim());
        if (messageVals.length !== 3) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ To many or not enough parameters! Type \'!help wr\' for an overview of the required parameters.');
            isWring = false;
            return;
        }
        const season = getSeasonOptions(messageVals[0]);
        if (!season) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No season found for \'' + messageVals[0] + '\'.');
            isWring = false;
            return;
        }
        const mode = getModeOptions(messageVals[1]);
        if (!mode) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No mode found for \'' + messageVals[1] + '\'.');
            isWring = false;
            return;
        }
        var map;
        const opts = await getMapOptions(messageVals[2]);
        if (!opts.length) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No map found for \'' + messageVals[2] + '\'.');
            isWring = false;
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
                    botMsg.edit('⌛ Timeout while selecting map! No World Record requested.');
                    isWring = false;
                    return;
                }
            }
        }
        const cache = await getWrCache();
        if (!cache[season][mode][map]) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No Word Record found for \''+season+' '+mode+' '+map+'\'. Go and set a record!');
            isWring = false;
            return;
        }
        const wr = cache[season][mode][map];
        const userStr = wr.user.split('#')[0];
        await message.clearReactions();
        message.react('✅');
        botMsg.edit('✅ World Record found!');

        message.channel.send('', {
            embed: {
                title: `World Record by ${userStr}`,
                url: `${wr.link}`,
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
                    name: 'Season',
                    value: `${season.replace('season', 'season ')}`,
                    inline: true,
                },
                {
                    name: 'Mode',
                    value: `${mode}`,
                    inline: true,
                },
                {
                    name: 'Map',
                    value: `${map}`,
                    inline: true,
                },
                {
                    name: 'User',
                    value: `${userStr}`,
                    inline: true,
                },
                {
                    name: 'Time',
                    value: `${wr.time}`,
                    inline: true,
                },
                {
                    name: 'Date',
                    value: `${wr.date}`,
                    inline: true,
                },],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'WR requested',
                },
            },
        });
        message.channel.send(`${wr.link}`);
        isWring = false;

    } catch (err) {
        await message.clearReactions();
        message.react('❌');
        botMsg.clearReactions();
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('Error in handleWr: ' + err.message);
        console.log(err.stack);
        isWring = false;
    }
}
