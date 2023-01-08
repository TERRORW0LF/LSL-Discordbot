import { Collection, Interaction } from "discord.js";
import { ApplicationCommandExecuter } from "../../commands/commandCollection.js";

export default async (commandCollection: Collection<string, ApplicationCommandExecuter>, interaction: Interaction) => {
    if (interaction.isAutocomplete()) {
        const command = commandCollection.get(interaction.commandName);
        if (command?.complete)
            command?.complete(interaction);
        else
            interaction.respond([]);
    }
}