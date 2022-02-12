import { getDesiredOptionLength, getOptions } from '../../../util/userInput.js';
import guildsConfig from '../../../config/guildConfig.json';
import { submit } from '../../../util/sheets.js';
import { CommandInteraction } from 'discord.js';
import { APIEmbed } from 'discord-api-types';

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
    try {
        await submit(interaction.guildId ?? "", { user: name, season: "" + season, category, map, time, proof });
    } catch (error) {
        const embed: APIEmbed = {
        description: `Failed to correctly submit run.`,
        color: guildConfig.embeds.error
    }
    interaction.editReply({ embeds: [embed] });
    return;
    }
    const embed: APIEmbed = {
        description: 'Successfully submitted run.',
        color: guildConfig.embeds.success
    }
    interaction.editReply({ embeds: [embed] });
}