'use strict'

import { SlashCommandBuilder } from '@discordjs/builders';
import { run as lb } from '../files/lookup/leaderboard';

export const command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show a leaderboard.')
        .addIntegerOption(option =>
            option.setName('season')
            .setDescription('The season of the leaderboard.')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the leaderboard.')
            .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
            .setDescription('The map of the leaderboard.')
            .setRequired(true))
        .addNumberOption(option =>
            option.setName('patch')
            .setDescription('The patch of the leaderboard.')
            .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
            .setRequired(false)),
    async execute (interaction) {
        return lb(interaction);
    }
}