import { CommandInteraction } from "discord.js";
import { selectShowcase, SelectShowcaseOption } from "../../../util/userInput.js";
import { getMembersWithPoints } from "../../../util/sheets.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };
import { APIEmbed } from "discord-api-types";
import { Category } from "../../../util/roleUpdate.js";

export async function run (interaction: CommandInteraction<"present">) {
    await interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);
    const category = interaction.options.getString('category', true) as Category;

    const membersWithPoints = await getMembersWithPoints(interaction.guildId, { patch, season });

    if (!membersWithPoints.size) {
        const embed: APIEmbed = {
            description: `No users found.`,
            color: guildCfg.embeds.error
        };
        interaction.editReply({ embeds: [embed] });
        return;
    }


    const filteredMembersWithPoints = membersWithPoints.filter(points => points[category] !== 0).sort((points1, points2) => points2[category] - points1[category]);
    let place = 0;
    const showcaseMembers: SelectShowcaseOption[] = filteredMembersWithPoints.map((points, member) => {
        place++;
        return {
            dense: {
                place: `${place}`,
                user: member,
                points: `${points[category]}`
            },
            verbose: {
                description: {
                    Place: `${place}`,
                    User: member,
                    Points: `${points[category]}`,
                }
            }
        };
    });
    selectShowcase(interaction, null, showcaseMembers);
}