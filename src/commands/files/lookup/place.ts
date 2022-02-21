import { CommandInteraction, Formatters } from "discord.js";
import { getAllSubmits } from "../../../util/sheets";
import { getDesiredOptionLength, getOptions } from "../../../util/userInput";
import guildsCfg from '../../../config/guildConfig.json';
import { APIEmbed } from "discord-api-types";
import { pbsOnly, sortRuns } from "../../../util/runs";

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const rawPlace = interaction.options.getInteger('place', true);
    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);
    const category = interaction.options.getString('category', true);
    let map = interaction.options.getString('map', true);
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;

    const runsPromise = getAllSubmits(interaction.guildId, { patch, season });
    
    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const allRuns = await runsPromise;
    const runs = allRuns.filter(run => run.category === category && run.map === map);
    const pbs = pbsOnly(sortRuns(runs));
    let reqPlace: number;
    if (rawPlace === 0) reqPlace = 1;
    else if (rawPlace < 0)
        if (rawPlace + runs.length <= 0) reqPlace = 1;
        else reqPlace = rawPlace + pbs.length + 1;
    else if (rawPlace > runs.length) reqPlace = pbs.length;
    else reqPlace = rawPlace;
    const run = pbs.at(reqPlace - 1);
    if (!run) {
        const embed: APIEmbed = {
            description: `This map has no submitted runs.`,
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    let place = runs.findIndex(run1 => run1.time === run.time) + 1;
    if (place === 1 && run.submitId !== pbs[0].submitId) place = 2;
    const samePlaceUsers: string[] = [];
    if (run.submitId !== runs[0].submitId)
        for (const run1 of pbs)
            if (run1.time === run.time && run1.submitId !== pbs[0].submitId)
                samePlaceUsers.push(run1.username);
    const embed: APIEmbed = {
        title: `Place:`,
        description: `Translated place: *${reqPlace}*\nSheets place: *${place}*\nUser: *${run.username}*\nOther users: *${samePlaceUsers.join(', ')}*\n`
            + `Time: *${run.time.toFixed(2)}*\nDate: *${Formatters.time(run.date)}*\nProof: *${Formatters.hyperlink('link', run.proof)}*`,
        footer: { text: `ID: ${run.submitId}` }
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
    interaction.followUp(run.proof);
}