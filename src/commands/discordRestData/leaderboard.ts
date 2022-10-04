import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';
import { run as season } from '../files/lookup/leaderboardSeason.js';
import { run as category } from '../files/lookup/leaderboardCategory.js';
import { run as map } from '../files/lookup/leaderboardMap.js';


const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show a leaderboard.')
        .addSubcommand(sub =>
            sub.setName('season')
            .setDescription('Show the leaderboard for a season.')
            .addStringOption(option =>
                option.setName('season')
                .setDescription('The season of the leaderboard.')
                .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('patch')
                .setDescription('The patch of the leaderboard.')
                .addChoices([['Pre 1.41', '1.00'], ['1.41-1.50', '1.41'], ['1.51-2.00', '1.50'], ['Post 2.00', '2.00']])
                .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('category')
            .setDescription('Show the leaderboard for a category.')
            .addStringOption(option =>
                option.setName('season')
                .setDescription('The season of the leaderboard.')
                .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('category')
                .setDescription('The category of the leaderboard.')
                .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('patch')
                .setDescription('The patch of the leaderboard.')
                .addChoices([['Pre 1.41', '1.00'], ['1.41-1.50', '1.41'], ['1.51-2.00', '1.50'], ['Post 2.00', '2.00']])
                .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('map')
            .setDescription('Show the leaderboards for a map.')
            .addStringOption(option =>
                option.setName('season')
                .setDescription('The season of the leaderboard.')
                .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
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
            .addStringOption(option =>
                option.setName('patch')
                .setDescription('The patch of the leaderboard.')
                .addChoices([['Pre 1.41', '1.00'], ['1.41-1.50', '1.41'], ['1.51-2.00', '1.50'], ['Post 2.00', '2.00']])
                .setRequired(false))).toJSON(),
    async execute (interaction: CommandInteraction<"present">):Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "season": return season(interaction);
            case "category": return category(interaction);
            default: return map(interaction);
        }
    }
}

export default command;