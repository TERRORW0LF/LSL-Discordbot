'use strict'

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types';
import fs from 'fs';
import { discordToken, clientId } from './config/config';

let commands = [];
const commandFiles = fs.readdirSync('./commands/top level').filter(file => file.endsWith('.js'));

for (const file in commandFiles) {
    import command from `./commands/top level/${file}`;
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