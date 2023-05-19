import { SlashCommandBuilder } from '@discordjs/builders';
import { run as editId } from '../files/submit/editId.js';
import { run as editMap } from '../files/submit/editMap.js';
import { run as completeMap } from '../files/autocomplete/map.js';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('edit-run')
    .setDescription('Edit a run\'s proof.')
        .addSubcommand(sub =>
            sub.setName('id')
            .setDescription('Edit a run\'s proof by it\'s submit id.')
            .addStringOption(option =>
                option.setName('patch')
                .setDescription('The patch the run was submitted under.')
                .addChoices([['Pre 1.41', '1.00'], ['1.41-1.49', '1.41'], ['1.50-1.99', '1.50'], ['Post 2.00', '2.00']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('season')
                .setDescription('The season of the run.')
                .addChoices([['Season 1', '1'], ['Season 2', '2'], ['Season 3', '3'], ['Season 4', '4'], ['Season 5', '5']])
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName('id')
                .setDescription('The submit id of the run.')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('proof')
                .setDescription('The new link to the video proof.')
                .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('map')
            .setDescription('Edit a run\'s proof by map.')
            .addStringOption(option =>
                option.setName('patch')
                .setDescription('The patch the run was submitted under.')
                .addChoices([['Pre 1.41', '1.00'], ['1.41-1.49', '1.41'], ['1.50-1.99', '1.50'], ['Post 2.00', '2.00']])
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
                option.setName('proof')
                .setDescription('The new link to the video proof.')
                .setRequired(true))).toJSON(),
    async execute (interaction: CommandInteraction<"present">) {
        switch (interaction.options.getSubcommand(true)) {
            case 'id':
                return editId(interaction);
            case 'map':
                return editMap(interaction);
            default:
                throw new Error('Command not found');
        }
    },
    async complete (interaction: AutocompleteInteraction<'present'>) {
        return completeMap(interaction);
    }
}

export default command;