const axios = require('axios');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching dad joke, please hold on.')
    try {
        const dadJoke = await axios.get('https://icanhazdadjoke.com/', {headers: {"Accept": "text/plain", "User-Agent": "LSL Discord-bot (https://github.com/TERRORW0LF/LSL-Discordbot)"}});
        if (!dadJoke || dadJoke.status !== 200) return botMsg.edit('❌ Could not find a dad joke, please try again later.');
        
        botMsg.edit('```\n✅ '+dadJoke.data+'\n```');
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in dadJoke: '+err.message);
        console.log(err.stack);
    }
}