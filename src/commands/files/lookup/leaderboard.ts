import { CommandInteraction } from "discord.js";
import { getAllSubmits } from "../../../util/sheets";

export async function run (interaction: CommandInteraction<"present">) {
    interaction.deferReply();

    const patch = interaction.options.getString('patch', false) ?? '1.50';
    const season = interaction.options.getString('season', true);
    const category = interaction.options.getString('category', true);
    let map = interaction.options.getString('map');


    getAllSubmits(interaction.guildId, { patch, season });
    
}