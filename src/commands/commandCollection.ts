import fs from 'node:fs';
import { Collection, Interaction } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';

export interface ApplicationCommandExecuter {
    data: RESTPostAPIApplicationCommandsJSONBody,
    execute(interaction: Interaction): Promise<void>;
}

const commands: Collection<string, ApplicationCommandExecuter> = new Collection();

const commandFiles = fs.readdirSync('.dist/commands/discordRestData').filter(file => file.endsWith('.js'));
for (let file of commandFiles) {
    import(`./commands/discordRestData/${file}`).then((command: ApplicationCommandExecuter) =>
        commands.set(command.data.name, command));
}

export default commands;