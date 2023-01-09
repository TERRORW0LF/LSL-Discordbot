import axios from "axios";
import { CommandInteraction } from "discord.js";
import guildsCfg from '../../../config/guildConfig.json' assert { type: 'json' };

export async function run(interaction: CommandInteraction<'present'>): Promise<void> {
    const joke = await axios.get('https://icanhazdadjoke.com/', {headers: {"Accept": "text/plain", "User-Agent": "LSL Discord-bot (https://github.com/TERRORW0LF/LSL-Discordbot)"}});
    const guildCfg = (guildsCfg as any)[interaction.guildId] ?? guildsCfg.default;
    await interaction.reply({ embeds: [{color: guildCfg.embeds.success, description: joke.data }] });
}