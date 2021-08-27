'use strict'

import { SlashCommandBuilder } from '@discordjs/builders';
import { run as place } from '../files/lookup/place.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('place')
        .setDescription('Show the run of a place.')
        .addIntegerOption(option =>
            option.setName('place')
            .setDescription('The place of the run.')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('season')
            .setDescription('The season of the place.')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the place.')
            .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
            .setDescription('The map of the place.')
            .setRequired(true))
        .addNumberOption(option =>
            option.setName('patch')
            .setDescription('The patch of the place.')
            .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
            .setRequired(false)),
    async execute (interaction) {
        return pb(interaction);
    }
}