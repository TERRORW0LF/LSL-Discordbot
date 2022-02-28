import { APIEmbed } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { getAllSubmits } from "../../../util/sheets.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString("patch", false) ?? "1.50";
    const season = interaction.options.getString("season", true);
    const category = interaction.options.getString("category", true);
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    const allRuns = await getAllSubmits(interaction.guildId, { patch, season });
    const runs = allRuns.filter(run => run.category === category && run.username === user.tag);

    const maps: Set<string> = new Set(guildCfg.maps);
    const incompleteMaps: string[] = [];
    const completedMaps: Set<string> = new Set();
    for (const run of runs)
        completedMaps.add(run.map);
    for (const map of maps)
        if (!completedMaps.has(map))
            incompleteMaps.push(map);
    
    let description: string;
    if (!completedMaps.size)
        description = '*No maps completed. Go and set a time.*';
    else if (completedMaps.size === maps.size)
        description = '*You have completed all maps.*';
    else {
        description = `Completed:\n*${[...completedMaps].join(', ')}*\n\nIncomplete:\n*${[...incompleteMaps].join(', ')}*`;
    }
    const embed: APIEmbed = {
        title: 'Incomplete',
        description,
        color: guildCfg.embeds.success
    };

    await defer;
    interaction.editReply({ embeds: [embed] });
}