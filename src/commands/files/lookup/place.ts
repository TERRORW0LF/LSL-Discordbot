import { CommandInteraction, Formatters, Message } from "discord.js";
import { getAllSubmits } from "../../../util/sheets.js";
import { getDesiredOptionLength, getOptions } from "../../../util/userInput.js";
import { APIEmbed } from "discord-api-types";
import { getPlace, getPoints, pbsOnly, sortRuns } from "../../../util/runs.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    await interaction.deferReply();
    const proofMessage = interaction.channel?.send('.');

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
    if (!mapIndexes) {
        (await proofMessage)?.delete();
        return;
    }
    map = mapOptions[mapIndexes[0]];

    const allRuns = await runsPromise;
    const runs = allRuns.filter(run => run.category === category && run.map === map);
    const pbs = sortRuns(pbsOnly(runs));
    let reqPlace: number;
    if (rawPlace === 0) reqPlace = 1;
    else if (rawPlace < 0)
        if (rawPlace + pbs.length <= 0) reqPlace = 1;
        else reqPlace = rawPlace + pbs.length + 1;
    else if (rawPlace > pbs.length) reqPlace = pbs.length;
    else reqPlace = rawPlace;
    const run = pbs.at(reqPlace - 1);
    if (!run) {
        const embed: APIEmbed = {
            description: `This map has no submitted runs.`,
            color: guildCfg.embeds.error
        };
        interaction.editReply({ embeds: [embed] });
        (await proofMessage)?.delete();
        return;
    }
    const place = getPlace(run, pbs[0], pbs);
    const points = getPoints(run, pbs[0], place, map, category);
    let samePlaceUsers = 'none';
    if (run.submitId !== pbs[0].submitId)
        samePlaceUsers = pbs.filter(run1 => run1.time === run.time && run1.username !== run.username).join(', ') || 'none';
    
    const embed: APIEmbed = {
        title: `Place`,
        description: `Translated place: *${reqPlace}*\nSheets place: *${place}*\nUser: *${run.username}*\nOther users: *${samePlaceUsers}*\n`
            + `Time: *${run.time.toFixed(2)}*\nPoints: *${points}*\nDate: *${Formatters.time(run.date)}*\nProof: *${Formatters.hyperlink('link', run.proof)}*`,
        footer: { text: `ID: ${run.submitId}` },
        color: guildCfg.embeds.success
    };
    interaction.editReply({ embeds: [embed] });
    ((await proofMessage) as Message).edit(run.proof);
}