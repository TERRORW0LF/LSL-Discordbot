import { SlashCommandBuilder } from '@discordjs/builders';
import { run as ratio } from '../files/fun/ratio.js';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('ratio')
        .setDescription('Post a "L + ratio" copy pasta.')
        .addStringOption(opt =>
            opt.setName('length')
            .setDescription('Specifies the length of the copy pasta.')
            .addChoices([['Minimal', 'minimal'], ['Short', 'short'], ['Medium', 'medium'], ['Long', 'long']])
            .setRequired(true)).toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return ratio(interaction);
    }
}

export default command;