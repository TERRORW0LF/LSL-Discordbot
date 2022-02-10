import { SlashCommandBuilder } from '@discordjs/builders';
import { run as rankSeason } from '../files/lookup/rankSeason';
import { run as rankCategory } from '../files/lookup/rankCategory';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Show a rank.')
        .addSubcommand(sub =>
            sub.setName('season')
            .setDescription('Show a rank in a season.')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the ranking.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4], ['Season 5', 5]])
                .setRequired(true))
            .addUserOption(option =>
                option.setName('user')
                .setDescription('The user whose rank to show.')
                .setRequired(false))
            .addNumberOption(option =>
                option.setName('patch')
                .setDescription('The patch of the ranking.')
                .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
                .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('category')
            .setDescription('Show a rank in a category')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the ranking.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4], ['Season 5', 5]])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('category')
                .setDescription('The category of the ranking.')
                .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
                .setRequired(true))
            .addUserOption(option =>
                option.setName('user')
                .setDescription('The user whose rank to show.')
                .setRequired(false))
            .addNumberOption(option =>
                option.setName('patch')
                .setDescription('The patch of the ranking.')
                .addChoices([['Pre 1.41', 1.00], ['1.41-1.50', 1.41], ['Post 1.50', 1.50]])
                .setRequired(false))).toJSON(),
    async execute (interaction: CommandInteraction) {
        switch (interaction.options.getSubcommand(true)) {
            case 'season':
                return rankSeason(interaction);
            case 'category':
                return rankCategory(interaction);
            default:
                throw new Error('Command not found');
        }
    }
}

export default command;