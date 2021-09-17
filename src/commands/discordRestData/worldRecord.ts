import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { run as wr } from '../files/lookup/worldRecord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('world_record')
        .setDescription('Show a world record.')
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
            option.setName('patch')
            .setDescription('The patch of the leaderboard.')
            .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
            .setRequired(false)),
    async execute (interaction: CommandInteraction) {
        return wr(interaction);
    }
}