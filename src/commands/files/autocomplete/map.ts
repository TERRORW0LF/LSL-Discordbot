import { AutocompleteInteraction } from "discord.js";
import guildsCfg from "../../../config/guildConfig.json";
import { getOptions } from "../../../util/userInput";

export async function run(interaction: AutocompleteInteraction<'present'>): Promise<void> {
    const guildCfg = (guildsCfg as any)[interaction.guildId];
    const input = interaction.options.getFocused(true).value as string;
    const maps = guildCfg?.maps;
    if (!maps) interaction.respond([]);
    const options = getOptions(input, maps, { min: 0.05, max:1 }).slice(0, 5);
    await interaction.respond(options.map(option => { return { name:option, value: option }}));
}