import { CommandInteraction, Formatters } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const msg = `${Formatters.userMention(interaction.user.id)} flipped a coin and got **${Math.round(Math.random()) ? 'Heads' : 'Tails'}**!`;
    await interaction.reply({ embeds: [{color: guildCfg.embeds.success, description: msg }] });
}