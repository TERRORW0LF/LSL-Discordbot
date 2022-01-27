import { CommandInteraction } from 'discord.js';
import { Embed } from '@discordjs/builders';
import axios from 'axios';
import { getDesiredOptionLength, getOptions } from '../../../util/userInput.js';
import guildsConfig from '../../../config/guildConfig.json';

export async function run (interaction: CommandInteraction) {
    interaction.deferReply();

    const season = interaction.options.getInteger('season', true),
          category = interaction.options.getString('category', true),
          time = interaction.options.getNumber('time', true),
          proof = interaction.options.getString('proof', true),
          name = interaction.user.tag,
          guildConfig = (guildsConfig as any)[interaction.guildId ?? 'default'];
    let map = interaction.options.getString('map', true);
    
    const mapOptions = getOptions(map, guildConfig.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];

    const submitConfig = guildConfig.forms;
    let submitUrl = submitConfig[season]
        + `entry.${submitConfig.user}=${encodeURIComponent(name)}`
        + `entry.${submitConfig.category}=${encodeURIComponent(category)}`
        + `entry.${submitConfig.map}=${encodeURIComponent(map)}`
        + `entry.${submitConfig.time}=${encodeURIComponent(time)}`
        + `entry.${submitConfig.proof}=${encodeURIComponent(proof)}`;
    const res = await axios.post(submitUrl);
    if (res.status !== 200) {
        const embed = new Embed()
            .setDescription(`Failed to correctly submit run.`)
            .setColor(guildConfig.embeds.error);
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed = new Embed()
        .setDescription('Successfully submitted run.')
        .setColor(guildConfig.embeds.success);
    interaction.editReply({ embeds: [embed] });
}