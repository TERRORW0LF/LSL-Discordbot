import guildsCfg from '../../../config/guildConfig.json';
import { deleteSubmit } from "../../../util/sheets";
import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";

export async function run (interaction: CommandInteraction<"present">) {
    interaction.deferReply();

    const season = interaction.options.getInteger('season', true),
          id = interaction.options.getInteger('id', true),
          guildCfg = ((guildsCfg as any)[interaction.guildId ?? ""]) ?? guildsCfg.default;

    try {
        await deleteSubmit(interaction.guildId, id, { patch: "1.50", season: "" + season });
    } catch (error) {
        const embed: APIEmbed = {
            description: "Failed to delete run.",
            color: guildCfg.embeds.error
        }
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        description: "Successfully deleted run.",
        color: guildCfg.embeds.success
    }
    interaction.editReply({ embeds: [embed] });
}