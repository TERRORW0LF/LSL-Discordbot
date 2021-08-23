'use strict'

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import { discordToken, clientId } from './config/config.js';

let commands = [];
const commandFiles = fs.readdirSync('./src/commands/topLevel').filter(file => file.endsWith('.js'));

for (const file in commandFiles) {
    import(`./commands/topLevel/${file}`).then(({ command }) => {
        commands.push(command.data.toJSON());
    });
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