import { CommandInteraction } from "discord.js";
import { selectShowcase, SelectShowcaseOption } from "../../../util/userInput.js";
import { getMembersWithPoints } from "../../../util/sheets.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };
import { APIEmbed } from "discord-api-types";

export async function run (interaction: CommandInteraction<"present">) {
    await interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString('patch', false) ?? '2.00';
    const season = interaction.options.getString('season', true);

    const membersWithPoints = await getMembersWithPoints(interaction.guildId, { patch, season });

    if (!membersWithPoints.size) {
        const embed: APIEmbed = {
            description: `No users found.`,
            color: guildCfg.embeds.error
        };
        interaction.editReply({ embeds: [embed] });
        return;
    }

    membersWithPoints.sort((points1, points2) => points2.Total - points1.Total);
    let place = 0;
    const showcaseMembers: SelectShowcaseOption[] = membersWithPoints.map((points, member) => {
        place++;
        return {
            dense: {
                place: `${place}`,
                user: member,
                points: `${points.Total}`
            },
            verbose: {
                description: {
                    Place: `${place}`,
                    User: member,
                    Points: `${points.Total}`,
                }
            }
        };
    });
    selectShowcase(interaction, null, showcaseMembers);
}