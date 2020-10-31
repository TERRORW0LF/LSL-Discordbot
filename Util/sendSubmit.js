'use strict';

const getUser = require('./getUser');
const serverCfg = require('../Config/serverCfg.json');

module.exports = sendSubmit;

async function sendSubmit(guild, data) {
    try {
        if (!serverCfg[guild.id].channels.submit.enabled) return;
        const userStr = data.name.split('#')[0],
              user = await getUser(guild, data.name),
              channel = await guild.channels.cache.get(serverCfg[guild.id].channels.submit.channel);
        channel.send(`${user}`, {
            embed: {
                title: `new run submitted by ${userStr}`,
                url: `${data.proof}`,
                color: 3010349,
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${data.stage.split(' ').join('%20')}.jpg`,
                },
                fields: [{
                    name: 'Season',
                    value: `season ${data.season}`,
                    inline: true,
                },
                {
                    name: 'Category',
                    value: `${data.category}`,
                    inline: true,
                },
                {
                    name: 'Stage',
                    value: `${data.stage}`,
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
        channel.send(`${data.proof}`);
    } catch (err) {
        console.log('An error occured in sendSubmit: ' + err.message);
        console.log(err.stack);
    }
}
