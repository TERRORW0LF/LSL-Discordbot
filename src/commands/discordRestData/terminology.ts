import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ApplicationCommandExecuter } from "../commandCollection.js";
import { run as terminology } from "../files/lookup/terminology.js";

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('terminology')
        .setDescription('Get information on Lucio terminology / tech.')
        .addStringOption(opt =>
            opt.setName('name')
            .setDescription('The name of the terminology / tech.')
            .setChoices([["Controls", "controls"], ["Jump", "jump"], ["Skim", "skim"], ["Onetick", "onetick"], ["Latejump", "latejump"], ["Lateskim", "lateskim"],
                         ["Headhit", "headhit"], ["Ceiling boost", "ceilingBoost"], ["Curve boost", "curveBoost"], ["Ramp slide", "rampSlide"], ["V-Curve", "vCurve"]])
            .setRequired(true)).toJSON(),
    async execute(interaction: CommandInteraction<"present">): Promise<void> {
        return terminology(interaction);
    }
}

export default command;