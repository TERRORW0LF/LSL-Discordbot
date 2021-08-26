'use strict'

import { SlashCommandBuilder } from '@discordjs/builders';
import { run as submit } from '../files/submit/submit.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit a run to the leaderboards.')
        .addIntegerOption(option => 
            option.setName('season')
            .setDescription('The season of the run.')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
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
        .addNumberOption(option => 
            option.setName('time')
            .setDescription('The time of the run.')
            .setRequired('true'))
        .addStringOption(option =>
            option.setName('proof')
            .setDescription('A link to video proof of the run.')
            .setRequired(true)),
    async execute (interaction) {
        return submit(interaction);
    }
}