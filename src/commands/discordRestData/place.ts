import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';
import { run as place } from '../files/lookup/place.js';
import { run as completeMap} from '../files/autocomplete/map.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('place')
        .setDescription('Show the run at the specified place.')
        .addIntegerOption(option =>
            option.setName('place')
            .setDescription('The place the run is at. Negative values count backwards.')
            .setRequired(true))
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
            .setDescription('The patch the run was submitted under.')
            .addChoices([['Pre 1.41', '1.00'], ['1.41-1.49', '1.41'], ['1.50-1.99', '1.50'], ['Post 2.00', '2.00']])
            .setRequired(false)).toJSON(),
    async execute (interaction: CommandInteraction<"present">) {
        return place(interaction);
    },
    async complete (interaction: AutocompleteInteraction<'present'>) {
        return completeMap(interaction);
    }
}

export default command;