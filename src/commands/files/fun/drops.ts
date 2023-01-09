import { CommandInteraction, Formatters } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const drop = guildCfg.drops[Math.floor(Math.random() * guildCfg.drops.length)]
    await interaction.reply({ content: drop });
}