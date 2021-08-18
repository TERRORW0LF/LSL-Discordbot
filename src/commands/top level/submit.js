'use strict'

import { SlashCommandBuilder } from "@discordjs/builders";
import { run as submit } from '../files/submit/submit';

export const command = {
    data: shitfest,
    execute: async function (interaction) {
        return submit(interaction);
    }
}

let shitfest = new SlashCommandBuilder()
    .setName('Submit')
    .setDescription('Submit a run to the leaderboards.')
    .addIntegerOption(option => 
        option.setName('Season')
        .setDescription('The season of the run.')
        .addChoice('Season 1', 1)
        .addChoice('Season 2', 2)
        .addChoice('Season 3', 3)
        .addChoice('Season 4', 4)
        .setRequired(true))
    .addStringOption(option =>
        option.setName('Category')
        .setDescription('The category of the run.')
        .addChoice('Gravspeed', 'gravspeed')
        .addChoice('Standard', 'standard')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('Map')
        .setDescription('The map of the run.')
        .setRequired(true))
shitfest.options.push({
    name: 'Time',
    description: 'The time of the run.',
    type: 'NUMBER',
    required: true
});
shitfest
    .addStringOption(option =>
        option.setName('Proof')
        .setDescription('A link to video proof of the run.')
        .setRequired(true));