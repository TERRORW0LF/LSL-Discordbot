import fs from 'node:fs';
import { REST } from '@discordjs/rest';
import { RESTPutAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { discordToken, clientId } from './config/config.js';

let commands: RESTPutAPIApplicationCommandsJSONBody = [];
const commandFiles = fs.readdirSync('./dist/commands/discordRestData').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const { default: command } = await import(`./commands/discordRestData/${file}`);
    commands.push(command.data);
}

const rest = new REST({ version: '9' }).setToken(discordToken);

(async () => {
    try {
        console.log('Started refreshing application commands.');
        await rest.put(Routes.applicationGuildCommands(clientId, "574522788967088128"), { body: commands });
        console.log('Successfully reloaded application commands.');
    } catch (err) {
        console.error(err);
    }
})();