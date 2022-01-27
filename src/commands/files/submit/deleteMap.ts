import { CommandInteraction } from "discord.js";
import { getOptions, getDesiredOptionLength } from "../../../util/userInput";
import guildsConfig from '../../../config/guildConfig.json';
import { Embed } from "@discordjs/builders";

export async function run (interaction: CommandInteraction) {
    interaction.deferReply();

    const guildConfig = (guildsConfig as any)[interaction.guildId ?? 'default'],
          name = interaction.user.tag,
          season = interaction.options.getInteger('season', true),
          category = interaction.options.getString('category', true);
    let map = interaction.options.getString('map', true);

    const mapOptions = getOptions(map, guildConfig.maps),
          selectData = mapOptions.map(value => { return { label: value } });
     
    const mapIndexes = await getDesiredOptionLength('map', interaction, { placeholder: 'Select the desired map', data: selectData });
        if (!mapIndexes) 
            return;
        map = mapOptions[mapIndexes[0]];
    
}