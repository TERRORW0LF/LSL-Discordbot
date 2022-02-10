import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';
import { run as pb } from '../files/lookup/personalBest.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('personal_best')
        .setDescription('Show a personal best.')
        .addIntegerOption(option =>
            option.setName('season')
            .setDescription('The season of the run.')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4], ['Season 5', 5]])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the run.')
            .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
            .setDescription('The map of the run.')
            .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user whose pb to show.')
            .setRequired(false))
        .addNumberOption(option =>
            option.setName('patch')
            .setDescription('The patch the run was submitted under.')
            .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
            .setRequired(false)).toJSON(),
    async execute (interaction: CommandInteraction) {
        return pb(interaction);
    }
}

export default command;