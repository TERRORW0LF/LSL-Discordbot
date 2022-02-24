import { getDesiredOptionLength, getOptions } from "../../../util/userInput.js";
import { CommandInteraction, Formatters } from "discord.js";
import { getAllSubmits } from "../../../util/sheets.js";
import { APIEmbed } from "discord-api-types";
import { getPoints, sortRuns } from "../../../util/runs.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString("patch", false) ?? "1.50";
    const season = interaction.options.getString("season", true);
    const category = interaction.options.getString("category", true);
    let map = interaction.options.getString("map", true);

    const submitsPromise = getAllSubmits(interaction.guildId, { patch, season });

    await defer;
    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const allRuns = await submitsPromise;
    const runs = allRuns.filter(run => run.category === category && run.map === map);
    sortRuns(runs);
    const wr = runs[0];
    if (!wr) {
        const embed: APIEmbed = {
            description: `Couldn't find the world record.`,
            color: guildCfg.embeds.error
        }
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const points = getPoints(wr, wr, 1, map, category);
    const embed: APIEmbed = {
        title: `World Record`,
        description: `User: *${wr.username}*\nTime: *${wr.time.toFixed(2)}*\nPoints: *${points}*\nDate: *${Formatters.time(wr.date)}*\nProof: *${Formatters.hyperlink('link', wr.proof)}*`,
        footer: { text: `ID: ${wr.submitId}` }
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
    interaction.followUp(wr.proof);
}