'use strict'

import { SlashCommandBuilder } from '@discordjs/builders';
import { run as deleteProof } from '../files/submit/deleteProof.js';
import { run as deleteMap } from '../files/submit/deleteMap.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a run.')
        .addSubcommand(sub =>
            sub.setName('proof')
            .setDescription('Delete a run by proof.')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the run.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
                .setRequired(true))
            .addUserOption(option =>
                option.setName('proof')
                .setDescription('The link the proof of the run.')))
        .addSubcommand(sub =>
            sub.setName('map')
            .setDescription('Delete a run by map.')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the run.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4]])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('category')
                .setDescription('The category of the run.')
                .addChoices(['Standard', 'Standard'], [['Gravspeed', 'Gravspeed']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('map')
                .setDescription('The map of the run.')
                .setRequired(true))),
    async execute (interaction) {
        switch (interaction.getSubcommand(true)) {
            case 'proof':
                return deleteProof(interaction);
            case 'map':
                return deleteMap(interaction);
            default:
                throw new Error('Command not found');
        }
    }
}