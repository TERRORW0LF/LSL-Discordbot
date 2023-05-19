import { getOptions, getDesiredOptionLength, UserSelectOptionsOption } from "../../../util/userInput.js";
import { editSubmit, getAllSubmits } from "../../../util/sheets.js";
import { CommandInteraction, GuildMember } from "discord.js";
import { APIEmbed } from "discord-api-types";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default,
          name = interaction.user.tag,
          season = interaction.options.getString('season', true),
          category = interaction.options.getString('category', true),
          patch = interaction.options.getString('patch', true),
          proof = interaction.options.getString('proof', true);
    let map = interaction.options.getString('map', true);

    const mapOptions = getOptions(map, guildCfg.maps);
    const selectData: UserSelectOptionsOption[] = mapOptions.map(value => { return { label: value } });
    
    await defer;
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map.', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const submits = await getAllSubmits(interaction.guildId, { patch, season });
    let runs;
    if ((interaction.member as GuildMember).roles.cache.hasAny(...guildCfg.features.moderation))
        runs = submits.filter(submit => submit.category == category && submit.map == map);
    else
        runs = submits.filter(submit => submit.username === name && submit.category == category && submit.map == map);
    const runSelectData: UserSelectOptionsOption[] = runs.map(run => { return { label: "ID: " + run.submitId, description: `${run.username} | ${run.time.toFixed(2)} | ${run.date.getUTCDate()}/${run.date.getUTCMonth() + 1}/${run.date.getUTCFullYear()} ${run.date.getUTCHours()}:${run.date.getUTCMinutes()}:${run.date.getUTCSeconds()}` } }),
          runIndexes = await getDesiredOptionLength('submit', interaction, { placeholder: 'Select the run to edit.', data: runSelectData });
    if (!runIndexes)
        return;
    const run = runs[runIndexes[0]];

    try {
        await editSubmit(interaction.guildId, run.submitId, proof, { patch, season });
    } catch (error) {
        const embed: APIEmbed = {
            description: 'Failed to edit run.',
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        description: 'Successfully edited run.',
        color: guildCfg.embeds.success
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
}