import Collection from "@discordjs/collection";
import fs from 'fs';
import { ApplicationCommandExecuter } from "../../typings";

const commands: Collection<string, ApplicationCommandExecuter> = new Collection();

const commandFiles = fs.readdirSync('./commands/discordRestData').filter(file => file.endsWith('.js'));
for (let file of commandFiles) {
    const command: ApplicationCommandExecuter = await import(`./commands/discordRestData/${file}`);
    commands.set(command.data.name, command);
}

export default commands;