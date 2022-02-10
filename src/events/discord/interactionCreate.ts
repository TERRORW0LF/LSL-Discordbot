import guildsConfig from "../../config/guildConfig.json";
import { Collection, Interaction } from "discord.js";
import { ApplicationCommandExecuter } from "../../commands/commandCollection";

export default async (commandCollection: Collection<string, ApplicationCommandExecuter>, interaction: Interaction) => {
    if (interaction.isCommand()) {
        try {
            if (!interaction.inGuild()) {
                interaction.reply({ embeds: [{ description: 'This bot does not support DM commands.', color: guildsConfig.default.embeds.error }] });
                return;
            }
            const command = commandCollection.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        } catch (err) {
            const payload = { content: '', embeds: [{description: 'Something went wrong!', color: guildsConfig.default.embeds.error }] };
            if (interaction.deferred || interaction.replied)
                interaction.editReply(payload);
            else
                interaction.reply(payload);
        }
        return;
    }
}