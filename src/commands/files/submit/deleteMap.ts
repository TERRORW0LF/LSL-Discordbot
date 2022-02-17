import { getOptions, getDesiredOptionLength, UserSelectOptionsOption } from "../../../util/userInput";
import guildsCfg from '../../../config/guildConfig.json';
import { deleteSubmit, getAllSubmits } from "../../../util/sheets";
import { CommandInteraction, Formatters } from "discord.js";
import { APIEmbed } from "discord-api-types";

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const guildCfg = ((guildsCfg as any)[interaction.guildId]) ?? guildsCfg.default,
          name = interaction.user.tag,
          season = interaction.options.getString('season', true),
          category = interaction.options.getString('category', true);
    let map = interaction.options.getString('map', true);

    const mapOptions = getOptions(map, guildCfg.maps),
          selectData: UserSelectOptionsOption[] = mapOptions.map(value => { return { label: value } }),
          mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const submits = await getAllSubmits(interaction.guildId, { patch: "1.50", season: "" + season }),
          runs = submits.filter(submit => submit.username == name && submit.category == category && submit.map == map),
          runSelectData: UserSelectOptionsOption[] = runs.map(run => { return { label: "" + run.submitId, description: `${Formatters.time(run.date)} | ${run.time.toFixed(2)}` } }),
          runIndexes = await getDesiredOptionLength('submit', interaction, { placeholder: 'Select the run to delete.', data: runSelectData });
    if (!runIndexes)
        return;
    const run = runs[runIndexes[0]];

    try {
        await deleteSubmit(interaction.guildId, run.submitId, { patch: "1.50", season });
    } catch (error) {
        const embed: APIEmbed = {
            description: 'Failed to delete run.',
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        description: 'Successfully deleted run.',
        color: guildCfg.embeds.success
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
}