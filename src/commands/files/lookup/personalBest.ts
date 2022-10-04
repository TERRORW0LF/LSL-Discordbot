import { getAllSubmits } from "../../../util/sheets.js";
import { getDesiredOptionLength, getOptions } from "../../../util/userInput.js";
import { APIEmbed } from "discord-api-types";
import { CommandInteraction, Formatters, Message } from "discord.js";
import { getPlace, getPoints, pbsOnly, sortRuns } from "../../../util/runs.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run (interaction: CommandInteraction<"present">) {
    await interaction.deferReply();
    const proofMessage = interaction.channel?.send('.');

    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    const patch = interaction.options.getString("patch", false) ?? "2.00";
    const season = interaction.options.getString("season", true);
    const category = interaction.options.getString("category", true);
    let map = interaction.options.getString("map", true);
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    const submitsPromise = getAllSubmits(interaction.guildId, { patch, season });

    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map.', data: selectData });
    if (!mapIndexes) {
        (await proofMessage)?.delete();
        return;
    }
    map = mapOptions[mapIndexes[0]];

    const allRuns = await submitsPromise;
    const runs = allRuns.filter(run => run.category === category && run.map === map);
    const pbs = sortRuns(pbsOnly(runs));
    const pb = pbs.find(pb => pb.username === user.tag);
    if (!pb) {
        const embed: APIEmbed = {
            description: `Couldn't find your personal best.`,
            color: guildCfg.embeds.error
        }
        interaction.editReply({ embeds: [embed] });
        (await proofMessage)?.delete();
        return;
    };
    const place = getPlace(pb, pbs[0], pbs);
    const points = getPoints(pb, pbs[0], place, map, category);
    const embed: APIEmbed = {
        title: `Personal Best`,
        description: `Place: *${place}*\nTime: *${pb.time.toFixed(2)}*\nPoints: *${points}*\nDate: *${Formatters.time(pb.date)}*\nProof: *${Formatters.hyperlink('link', pb.proof)}*`,
        footer: { text: `ID: ${pb.submitId}` },
        color: guildCfg.embeds.success
    };
    interaction.editReply({ embeds: [embed] });
    ((await proofMessage) as Message).edit(pb.proof);
}