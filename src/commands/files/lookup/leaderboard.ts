import { CommandInteraction } from "discord.js";

export async function run (interaction: CommandInteraction<"present">) {
    interaction.deferReply();
}