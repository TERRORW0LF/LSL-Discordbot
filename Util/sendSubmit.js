const getUser = require('./getUser');
const serverCfg = require('../Config/serverCfg.json');

module.exports = sendSubmit;

async function sendSubmit(guild, data) {
    try {
        if (!serverCfg[guild.id].channels.submit.enabled) return;
        const userStr = data.user.split('#')[0],
              user = await getUser(guild, data.user),
              channel = await guild.channels.get(serverCfg[guild.id].channels.submit.channel);
        channel.send(`${user}`, {
            embed: {
                title: `new run submitted by ${userStr}`,
                url: `${data.link}`,
                color: 3010349,
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${data.map.split(' ').join('%20')}.jpg`,
                },
                fields: [{
                    name: 'Season',
                    value: `season ${data.season}`,
                    inline: true,
                },
                {
                    name: 'Mode',
                    value: `${data.mode}`,
                    inline: true,
                },
                {
                    name: 'Map',
                    value: `${data.map}`,
                    inline: true,
                },
                {
                    name: 'User',
                    value: `${userStr}`,
                    inline: true,
                },
                {
                    name: 'Time',
                    value: `${data.time}`,
                    inline: true,
                },
                {
                    name: 'Date',
                    value: `${data.date}`,
                    inline: true,
                },],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'Run posted',
                },
            },
        });
        channel.send(`${data.link}`);
    } catch (err) {
        console.log('An error occured in sendSubmit: ' + err.message);
        console.log(err.stack);
    }
}
