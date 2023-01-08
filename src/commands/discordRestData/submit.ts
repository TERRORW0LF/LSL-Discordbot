import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';
import { run as submit } from '../files/submit/submit.js';
import { run as completeMap} from '../files/autocomplete/map.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit a run to the leaderboards.')
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
        .addNumberOption(option => 
            option.setName('time')
            .setDescription('The time of the run.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('proof')
            .setDescription('A link to video proof of the run.')
            .setRequired(true)).toJSON(),
    async execute (interaction: CommandInteraction<"present">) {
        return submit(interaction);
    },
    async complete (interaction: AutocompleteInteraction<'present'>) {
        return completeMap(interaction);
    }
}

export default command;