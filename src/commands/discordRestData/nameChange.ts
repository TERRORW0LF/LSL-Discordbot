import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { run as nameChange } from '../files/submit/nameChange.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('change-name')
        .setDescription('Change your old leaderboard name to your current discord tag.')
        .addStringOption(option =>
            option.setName('tag')
            .setDescription('Your old tag you want to change.')
            .setRequired(true)).toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return nameChange(interaction);
    }
}

export default command;