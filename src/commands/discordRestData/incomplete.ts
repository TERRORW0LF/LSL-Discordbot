import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { run as incomplete } from '../files/lookup/incomplete.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('incomplete')
        .setDescription('Show uncompleted maps.')
        .addStringOption(option =>
            option.setName('season')
            .setDescription('The season of the run.')
            .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the run.')
            .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('patch')
            .setDescription('The patch the run was submitted under.')
            .addChoices([['Pre 1.41', '1.00'], ['1.41-1.49', '1.41'], ['1.50-1.99', '1.50'], ['Post 2.00', '2.00']])
            .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user whose uncompleted maps to show.')
            .setRequired(false)).toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return incomplete(interaction);
    } 
}

export default command;