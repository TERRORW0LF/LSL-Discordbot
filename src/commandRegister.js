'use strict'

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types');
const fs = require('fs');
const { discordToken, clientId } = require('./config/config.js');

let commands = [];
const commandFiles = fs.readdirSync('./commands/top level').filter(file => file.endsWith('.js'));

for (const file in commandFiles) {
    const command = require(`./commands/top level/${file}`);
    commands.push(command.data.toJson());
}

const rest = new REST({ version: 9 }).setToken(discordToken);

(async () => {
    try {
        console.log('Started refreshing application commands.');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded application commands.');
    } catch (err) {
        console.error(err);
    }
})();