import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import guildsCfg from "../../../config/guildConfig.json" assert { type: 'json' };

export async function run(interaction: CommandInteraction<"present">): Promise<void> {
    const techName = interaction.options.getString('name', true);
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;

    const explanation = guildCfg?.terminology?.[techName] ?? '*No explanation found.*';
    const embed: APIEmbed = {
        description: explanation,
        color: guildCfg.embeds.info
    };
    await interaction.reply({ embeds: [embed] });
}