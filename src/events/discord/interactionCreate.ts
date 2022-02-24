import { Collection, Interaction } from "discord.js";
import { ApplicationCommandExecuter } from "../../commands/commandCollection.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default async (commandCollection: Collection<string, ApplicationCommandExecuter>, interaction: Interaction) => {
    if (interaction.isCommand()) {
        try {
            if (!interaction.inGuild()) {
                interaction.reply({ embeds: [{ description: 'This bot does not support DM commands.', color: guildsCfg.default.embeds.error }] });
                return;
            }
            const command = commandCollection.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        } catch (err) {
            const payload = { content: '', embeds: [{description: 'Something went wrong!', color: guildsCfg.default.embeds.error }] };
            if (interaction.deferred || interaction.replied)
                interaction.editReply(payload);
            else
                interaction.reply(payload);
        }
        return;
    }
}