import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { getMembersWithPoints } from "../../../util/sheets";
import guildsCfg from '../../../config/guildConfig.json';

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const tag = interaction.user.tag;
    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);

    const memberPoints = await getMembersWithPoints(interaction.guildId, { patch, season });
    const user = memberPoints.get(tag);
    if (!user) {
        const embed: APIEmbed = {
            description: `Unable to find your season ${season} rank.`,
            color: guildCfg.embeds.error
        }
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    let rank = 1;
    for (const memberPoint of memberPoints.values())
        if (memberPoint.Total > user.Total)
            rank++;
    const embed: APIEmbed = {
        title: `Season Rank:`,
        description: `Rank: *${rank}*\nPoints: *${user.Total}*`
    }
    await defer;
    interaction.editReply({ embeds: [embed] });
}