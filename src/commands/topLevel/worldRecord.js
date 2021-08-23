'use strict'

import { SlashCommandBuilder } from '@discordjs/builders';
import { run as wr } from '../files/lookup/worldRecord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('world_record')
        .setDescription('Show a world record')
        .addIntegerOption(option =>
            option.setName('season')
            .setDescription('The season of the run')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the run.')
            .addChoices([['Gravspeed', 'gravspeed'], ['Standard', 'standard']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
            .setDescription('The map of the run')
            .setRequired(true)),
    async execute (interaction) {
        return wr(interaction);
    }
}