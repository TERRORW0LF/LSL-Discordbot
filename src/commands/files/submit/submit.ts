import { getDesiredOptionLength, getOptions } from '../../../util/userInput.js';
import guildsCfg from '../../../config/guildConfig.json';
import { submit } from '../../../util/sheets.js';
import { CommandInteraction } from 'discord.js';
import { APIEmbed } from 'discord-api-types';

export async function run (interaction: CommandInteraction<"present">) {
    const defer = interaction.deferReply();

    const season = interaction.options.getString('season', true),
          category = interaction.options.getString('category', true),
          time = interaction.options.getNumber('time', true),
          proof = interaction.options.getString('proof', true),
          user = interaction.user.tag,
          guildCfg = ((guildsCfg as any)[interaction.guildId]) ?? guildsCfg.default;
    let map = interaction.options.getString('map', true);
    
    const mapOptions = getOptions(map, guildCfg.maps),
          selectData = mapOptions.map(value => { return { label: value } });
    
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
    if (!mapIndexes)
        return;
    map = mapOptions[mapIndexes[0]];
    
    try {
        await submit(interaction.guildId, { user, season, category, map, time, proof });
    } catch (error) {
        const embed: APIEmbed = {
            description: `Failed to submit run.`,
            color: guildCfg.embeds.error
        };
        await defer;
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const embed: APIEmbed = {
        description: 'Successfully submitted run.',
        color: guildCfg.embeds.success
    };
    await defer;
    interaction.editReply({ embeds: [embed] });
}