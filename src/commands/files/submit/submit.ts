import { CommandInteraction } from 'discord.js';
import { Embed } from '@discordjs/builders';
import axios from 'axios';
import { getOptions, userSelect } from '../../../util/userInput.js';
import guildsConfig from '../../../config/guildConfig.json';

export async function run (interaction: CommandInteraction) {
    const season = interaction.options.getInteger('season', true),
          category = interaction.options.getString('category', true),
          time = interaction.options.getNumber('time', true),
          proof = interaction.options.getString('proof', true),
          name = interaction.user.tag,
          guildConfig = (guildsConfig as any)[interaction.guildId ?? 'default'];
    let map = interaction.options.getString('map', true);
    
    const mapOptions = getOptions(map, guildConfig.maps);
    if (!mapOptions.length) {
        const embed = new Embed()
            .setDescription(`No map found for input: **${map}**.`)
            .setColor(guildConfig.embeds.error);
        interaction.reply({ embeds: [embed] });
        return;
    }
    if (mapOptions.length !== 1) {
        const embed = new Embed()
            .setDescription(`Select the desired map from the options below.`)
            .setColor(guildConfig.embeds.waiting);
        const selectData = mapOptions.map(value => { return { label: value } })
        await interaction.reply({ embeds: [embed] });
        try {
            map = (await userSelect(interaction, { placeholder: 'Select the desired map.', data: selectData }))[0];
        } catch(e) {
            const embed = new Embed()
                .setDescription('No map selected.')
                .setColor(guildConfig.embeds.error);
            interaction.editReply({ embeds: [embed] });
            return;
        }
    }

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
        if (interaction.deferred || interaction.replied)
            interaction.editReply({ embeds: [embed] });
        else 
            interaction.reply({ embeds: [embed] });
        return;
    }
    const embed = new Embed()
        .setDescription('Successfully submitted run.')
        .setColor(guildConfig.embeds.success);
    if (interaction.deferred ||interaction.replied)
        interaction.editReply({ embeds: [embed] });
    else
        interaction.reply({ embeds: [embed] });
}