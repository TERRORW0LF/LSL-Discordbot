const Discord = require("discord.js");

module.exports = {
    getDiscordClient,
    setDiscordClient
}

let client;

async function getDiscordClient() {
    if (!client) await setDiscordClient;
    return client;
}

async function setDiscordClient() {
    client = new Discord.Client();
    await client.login(process.env.discordTOKEN);
    return client;
}