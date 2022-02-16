import { getDesiredOptionLength, getOptions } from "../../../util/userInput";
import guildsCfg from '../../../config/guildConfig.json';
import { CommandInteraction, Formatters } from "discord.js";
import { getAllSubmits, sortRuns } from "../../../util/sheets";
import { APIEmbed } from "discord-api-types";

export async function run (interaction: CommandInteraction<"present">) {
    interaction.deferReply();

    const patch = interaction.options.getString("patch", false) ?? "1.50";
    const season = interaction.options.getString("season", true);
    const category = interaction.options.getString("category", true);
    let map = interaction.options.getString("map", true);
    const guildId = interaction.guildId;
    const guildCfg = (guildsCfg as any)[guildId] ?? guildsCfg.default;

    const submitsPromise = getAllSubmits(guildId, { patch, season });

    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const submits = await submitsPromise;
    submits.filter(run => run.category === category && run.map === map);
    sortRuns(submits);
    const wr = submits[0];
    if (!wr) {
        const embed: APIEmbed = {
            description: `Couldn't find the world record.`,
            color: guildCfg.embeds.error
        }
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        title: `World Record:`,
        description: `User: *${wr.username}*\nTime: *${wr.time.toFixed(2)}*\nDate: *${Formatters.time(wr.date)}*\nProof: *${Formatters.hyperlink('link', wr.proof)}*`,
        footer: { text: `ID: ${wr.submitId}` }
    };
    interaction.editReply({ embeds: [embed] });
    interaction.followUp(wr.proof);
}