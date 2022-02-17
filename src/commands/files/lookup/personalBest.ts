import { getAllSubmits, sortRuns } from "../../../util/sheets";
import { getDesiredOptionLength, getOptions } from "../../../util/userInput";
import guildsCfg from '../../../config/guildConfig.json';
import { APIEmbed } from "discord-api-types";
import { CommandInteraction, Formatters } from "discord.js";

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const patch = interaction.options.getString("patch", false) ?? "1.50";
    const season = interaction.options.getString("season", true);
    const category = interaction.options.getString("category", true);
    let map = interaction.options.getString("map", true);
    const user = interaction.options.getUser('user', false) ?? interaction.user;
    const guildId = interaction.guildId;
    const guildCfg = (guildsCfg as any)[guildId] ?? guildsCfg.default;

    const submitsPromise = getAllSubmits(guildId, { patch, season });

    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const allRuns = await submitsPromise;
    const runs = allRuns.filter(run => run.category === category && run.map === map && run.username === user.tag);
    sortRuns(runs);
    const pb = runs[0];
    if (!pb) {
        const embed: APIEmbed = {
            description: `Couldn't find your personal best.`,
            color: guildCfg.embeds.error
        }
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    };
    //TODO: calculate points.
    const embed: APIEmbed = {
        title: `Personal Best:`,
        description: `Time: *${pb.time.toFixed(2)}*\nDate: *${Formatters.time(pb.date)}*\nProof: *${Formatters.hyperlink('link', pb.proof)}*`,
        footer: { text: `ID: ${pb.submitId}` }
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
    interaction.followUp(pb.proof);
}