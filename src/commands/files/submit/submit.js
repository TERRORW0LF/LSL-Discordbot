'use strict'

import { Embed } from '@discordjs/builders';
import { getOptions, userSelect } from '../../../util/userInput.js';
import { getErrorEmbed, getSuccessEmbed } from '../../../util/embeds.js';
import { guildsConfig } from '../../../config/guildConfig.json';

export async function run (interaction) {
    const season = interaction.options.getIntegerOption('season', true),
          category = interaction.options.getStringOption('category', true),
          map = interaction.options.getStringOption('map', true),
          time = interaction.options.getNumberOption('time', true),
          proof = interaction.options.getStringOption('proof', true),
          name = interaction.user.tag,
          guildConfig = guildConfig[interaction.guildId];
    
    const mapOptions = getOptions(map, guildConfig.maps);
    if (!mapOptions) {
        interaction.reply();
    }
    else
        map = await userSelect(interaction, mapOptions);
}