const getUser = require('./getUser');

module.exports = sendSubmit;

async function sendSubmit(discord, data) {
    try {
        const userStr = data.user.split('#')[0];
        const guild = await discord.guilds.get(process.env.DiscordGUILD);
        const user = await getUser(guild, data.user);
        const channel = await guild.channels.get(process.env.submitCHANNEL);
        channel.send(`new run submitted! ${user}`, {
            embed: {
                title: `new run submitted by ${userStr}`,
                url: `${data.link}`,
                color: 3010349,
                author: {
                    name: 'LSL-discordbot',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                },
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${data.map.split(' ').join('%20')}.jpg`,
                },
                fields: [{
                    name: 'Season',
                    value: `${data.season.replace('season', 'season ')}`,
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
