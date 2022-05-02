import { CommandInteraction } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export type RatioLengths = "minimal" | "short" | "medium" | "long";

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const length = interaction.options.getString('length', true) as RatioLengths;
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const msg: string = guildCfg?.ratio?.[length] ?? guildsCfg.default.ratio[length];
    await interaction.reply({ embeds: [{color: guildCfg.embeds.info, description: msg}] });
}