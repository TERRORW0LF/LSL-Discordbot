import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { Category } from "../../../util/roleUpdate.js";
import { getMembersWithPoints } from "../../../util/sheets.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString('patch', false) ?? '2.00';
    const season = interaction.options.getString('season', true);
    const category: Category = interaction.options.getString('category', true) as Category;
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    const memberPoints = await getMembersWithPoints(interaction.guildId, { patch, season });
    const rankUser = memberPoints.get(user.tag);
    if (!rankUser || rankUser[category] === 0) {
        const embed: APIEmbed = {
            description: `Unable to find your season ${season} ${category} rank.`,
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const rank = memberPoints.filter(points => points[category] > rankUser[category]).size + 1;
    const embed: APIEmbed = {
        title: `Category Rank`,
        description: `Rank: *${rank}*\nPoints: *${rankUser[category]}*`,
        color: guildCfg.embeds.success
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
}