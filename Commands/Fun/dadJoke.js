const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const axios = require('axios');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching dad joke, please hold on.', 'Working', msg.guild.id));
    try {
        const dadJoke = await axios.get('https://icanhazdadjoke.com/', {headers: {"Accept": "text/plain", "User-Agent": "LSL Discord-bot (https://github.com/TERRORW0LF/LSL-Discordbot)"}});
        if (!dadJoke || dadJoke.status !== 200) return botMsg.edit(createEmbed('Could not find a dad joke, please try again later.', 'Error', msg.guild.id));
        
        botMsg.edit(createEmbed(`${dadJoke.data}`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in dadJoke: '+err.message);
        console.log(err.stack);
    }
}