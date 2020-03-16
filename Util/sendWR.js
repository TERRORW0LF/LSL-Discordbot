const getUser = require('./getUser');

module.exports = sendWr;

async function sendWr(discord, data) {
    try {
        const userStr = data.user.split('#')[0];
        const oldUserStr = data.oldUser.split('#')[0];
        const guild = await discord.guilds.get(process.env.DiscordGUILD);
        const user = await getUser(guild, data.user);
        const oldUser = await getUser(guild, data.oldUser);
        const channel = await guild.channels.get(process.env.wrCHANNEL);
        var dateDif;
        if (data.oldDate !== 'None') {
            const oldDateArray = data.oldDate.split('/');
            const oldDate = new Date(oldDateArray[2], oldDateArray[0], oldDateArray[1]);
            const dateArray = data.date.split('/');
            const date = new Date(dateArray[2], dateArray[0], dateArray[1]);
            const msDay = 1000*60*60*24;
            dateDif = Math.round((date-oldDate)/msDay);
        } else dateDif = 'None';
        var timeSave;
        data.oldTime !== 'None' ? timeSave = (Number(data.oldTime) - Number(data.time)).toFixed(2) : timeSave = 'None';
        channel.send(`New WORLD RECORD! ${user}`, {
            embed: {
                title: `Record submitted by ${userStr}`,
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
                description: `Season:  ${data.season.replace('season', 'season ')}\nMode:   ${data.mode}\nMap:    ${data.map}`,
                fields: [
                    {
                        name: '__New Record__',
                        value: `User:\t${userStr}\nTime:\t${data.time}\nDate:\t${data.date}`,
                        inline: true,
                    },
                    {
                        name: '__Old Record__',
                        value: `User:\t${oldUserStr}\nTime:\t${data.oldTime}\nDate:\t${data.oldDate}`,
                        inline: true,
                    },
                    {
                        name: '__Comparison__',
                        value: `Time save:    ${timeSave}s\nRecord held:  ${dateDif} days`,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Record posted',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                },
            },
        });
        channel.send(`${data.user !== data.oldUser && typeof oldUser !== 'string' ? getBM(oldUser) : ''}\n ${data.link}`);
    } catch (err) {
        console.log('An error occured in sendWR: '+err.message);
        console.log(err.stack);
    }
}

function getBM(user) {
    const bm = [
        'is not gonna like that!',
        'is all washed up!',
        'is still a pretty good surfer, I guess.',
        'you\'re too slow!',
        'it\'s time for a comeback!',
        'get it back, if you can.',
        'had a good run.',
        'stop sandbagging!'
    ];
    const msg = Math.round(Math.random()*bm.length-1);
    return `${user} ${bm[msg]}`
}
