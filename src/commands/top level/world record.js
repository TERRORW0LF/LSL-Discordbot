'use strict'

import { SlashCommandBuilder } from "@discordjs/builders";
import { run as wr } from '../files/lookup/world record';

export const command = {
    data: new SlashCommandBuilder()
        .setName('World_record')
        .setDescription('Show a world record')
        .addIntegerOption(option =>
            option.setName('Season')
            .setDescription('The season of the run')
            .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('Category')
            .setDescription('The category of the run.')
            .addChoices([['Gravspeed', 'gravspeed'], ['Standard', 'standard']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('Map')
            .setDescription('The map of the run')
            .setRequired(true)),
    execute: async function (interaction) {
        return wr(interaction);
    }
}