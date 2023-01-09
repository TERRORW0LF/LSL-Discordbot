import { CommandInteraction, Formatters } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const faces = interaction.options.getInteger('faces', false) ?? 6;
    const count = interaction.options.getInteger('count', false) ?? 1;
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    let msg = `${Formatters.userMention(interaction.user.id)} threw **${count} ${faces}** sided dice and got:\n`;
    for (let i = 0; i < count - 1; i++) {
        msg += `**${Math.floor(Math.random() * faces) + 1}**, `;
    }
    msg += `**${Math.floor(Math.random() * faces) + 1}**`;
    await interaction.reply({ embeds: [{color: guildCfg.embeds.success, description: msg }] });
}