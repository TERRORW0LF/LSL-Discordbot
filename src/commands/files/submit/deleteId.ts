import { deleteSubmit, getAllSubmits } from "../../../util/sheets.js";
import { APIEmbed } from "discord-api-types";
import { CommandInteraction, GuildMember } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const season = interaction.options.getString('season', true),
          id = interaction.options.getInteger('id', true),
          guildCfg = (guildsCfg as any)[interaction.guildId ?? ""] ?? guildsCfg.default;

    const runs = await getAllSubmits(interaction.guildId, { patch: '2.00', season });
    const run = runs.find(run => run.submitId === id);
    if (!run || (run.username !== interaction.user.tag 
        && !(interaction.member as GuildMember).roles.cache.hasAny(...guildCfg.features.moderation))) {
        const embed: APIEmbed = {
            description: "No run with matching id found or missing permission.",
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }

    try {
        await deleteSubmit(interaction.guildId, id, { patch: "2.00", season });
    } catch (error) {
        const embed: APIEmbed = {
            description: "Failed to delete run.",
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        description: "Successfully deleted run.",
        color: guildCfg.embeds.success
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
}