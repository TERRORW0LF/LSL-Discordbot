import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json';
import { Category } from "../../../util/roleUpdate";
import { getMembersWithPoints } from "../../../util/sheets";

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const tag = interaction.user.tag;
    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);
    const category: Category = interaction.options.getString('category', true) as Category;

    const memberPoints = await getMembersWithPoints(interaction.guildId, { patch, season });
    const user = memberPoints.get(tag);
    if (!user || user[category] === 0) {
        const embed: APIEmbed = {
            description: `Unable to find your season ${season} ${category} rank.`,
            color: guildCfg.embeds.error
        }
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    let rank = 1;
    for (const memberPoint of memberPoints.values())
        if (memberPoint[category] > user[category])
            rank++;
    const embed: APIEmbed = {
        title: `Category Rank:`,
        description: `Rank: *${rank}*\nPoints: *${user[category]}*`
    }
    await defer;
    interaction.editReply({ embeds: [embed] });
}