import { SlashCommandBuilder } from '@discordjs/builders';
import { run as deleteId } from '../files/submit/deleteId';
import { run as deleteMap } from '../files/submit/deleteMap';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a run.')
        .addSubcommand(sub =>
            sub.setName('id')
            .setDescription('Delete a run by it\'s submit id.')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the run.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4], ['Season 5', 5]])
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName('id')
                .setDescription('The submit id of the run.')))
        .addSubcommand(sub =>
            sub.setName('map')
            .setDescription('Delete a run by map.')
            .addIntegerOption(option =>
                option.setName('season')
                .setDescription('The season of the run.')
                .addChoices([['Season 1', 1], ['Season 2', 2], ['Season 3', 3], ['Season 4', 4], ['Season 5', 5]])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('category')
                .setDescription('The category of the run.')
                .addChoices([['Standard', 'Standard'], ['Gravspeed', 'Gravspeed']])
                .setRequired(true))
            .addStringOption(option =>
                option.setName('map')
                .setDescription('The map of the run.')
                .setRequired(true))).toJSON(),
    async execute (interaction: CommandInteraction<"present">) {
        switch (interaction.options.getSubcommand(true)) {
            case 'id':
                return deleteId(interaction);
            case 'map':
                return deleteMap(interaction);
            default:
                throw new Error('Command not found');
        }
    }
}

export default command;