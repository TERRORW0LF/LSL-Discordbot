const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions');
const getMapOptions = require('../Options/mapOptions');
const getUserReaction = require('../Util/UserReaction');
const { getPbCache } = require('../Util/pbCache');

module.exports = handlePb;

let isPbing = false;

async function handlePb (message) {
    if (isPbing) return;
    isPbing = true;

    message.react('💬');
    const botMsg = await message.channel.send('💬 Searching personal Best, please hold on.');
    try {
        const userStr = message.author.username;
        const messageVals = await message.content.replace(/?pb /i, '').split(',').map(i => i.trim());
        if (messageVals.length !== 3) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ To many or not enough parameters! Type \'!help pb\' for an overview of the required parameters.');
            isPbing = false;
            return;
        }
        const season = getSeasonOptions(messageVals[0]);
        if (!season) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No season found for \'' + messageVals[0] + '\'.');
            isPbing = false;
            return;
        }
        const mode = getModeOptions(messageVals[1]);
        if (!mode) {
            await message.clearReactions();
            message.react('❌');
            botMsg.edit('❌ No mode found for \'' + messageVals[1] + '\'.');
            isPbing = false;
            return;
        }
        const user = message.author.tag;
        var map;
        const opts = await getMapOptions(messageVals[2]);
        if (!opts.length) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No map found for \'' + messageVals[2] + '\'.');
            isPbing = false;
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
                    botMsg.edit('⌛ Timeout while selecting map! No Personal Best requested.');
                    isPbing = false;
                    return;
                }
            }
        }
        const cache = await getPbCache();
        if (!cache[season][mode][map]) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No Personal Best found for \''+season+' '+mode+' '+map+'\'. Go and set a time!');
            isPbing = false;
            return;
        }
        if (!cache[season][mode][map][user]) {
            await message.clearReactions();
            message.react('❌');
            botMsg.clearReactions();
            botMsg.edit('❌ No Personal Best found for \''+season+' '+mode+' '+map+'\'. Go and set a time!');
            isPbing = false;
            return;
        }
        const pb = cache[season][mode][map][user];
        message.clearReactions();
        message.react('✅');
        botMsg.clearReactions();
        botMsg.edit('✅ Personal Best found!');

        message.channel.send('', {
            embed: {
                title: `Personal Best for ${userStr}`,
                url: `${pb.link}`,
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
                    value: `${pb.time}`,
                    inline: true,
                },
                {
                    name: 'Date',
                    value: `${pb.date}`,
                    inline: true,
                },],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'PB requested',
                },
            },
        });
        message.channel.send(`${pb.link}`);
        isPbing = false;

    } catch (err) {
        await message.clearReactions();
        message.react('❌');
        botMsg.clearReactions();
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('Error in handlePb: ' + err.message);
        console.log(err.stack);
        isPbing = false;
    }
}
