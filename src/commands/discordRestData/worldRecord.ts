import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';
import { run as wr } from '../files/lookup/worldRecord.js';
import { run as completeMap} from '../files/autocomplete/map.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('world-record')
        .setDescription('Show a world record.')
        .addStringOption(option =>
            option.setName('season')
            .setDescription('The season of the run.')
            .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
            .setDescription('The category of the run.')
            .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
            .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
            .setDescription('The map of the run.')
            .setAutocomplete(true)
            .setRequired(true))
        .addStringOption(option =>
            option.setName('patch')
            .setDescription('The patch of the leaderboard.')
            .addChoices([['Pre 1.41', '1.00'], ['1.41-1.49', '1.41'], ['1.50-1.99', '1.50'], ['Post 2.00', '2.00']])
            .setRequired(false)).toJSON(),
    async execute (interaction: CommandInteraction<"present">) {
        return wr(interaction);
    },
    async complete (interaction: AutocompleteInteraction<'present'>) {
        return completeMap(interaction);
    }
}

export default command;