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
            const guildCfg = (guildsCfg as any)[interaction.guildId ?? ''] ?? guildsCfg.default;
            const payload = { content: null, embeds: [{description: 'Something went wrong!', color: guildCfg.embeds.error }] };
            if (interaction.deferred || interaction.replied)
                interaction.editReply(payload);
            else
                interaction.reply(payload);
        }
        return;
    }
    if (interaction.isAutocomplete()) {
        const command = commandCollection.get(interaction.commandName);
        if (command?.complete)
            command?.complete(interaction);
        else
            interaction.respond([]);
    }
}