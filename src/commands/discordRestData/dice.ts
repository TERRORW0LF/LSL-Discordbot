import { SlashCommandBuilder } from '@discordjs/builders';
import { run as dice } from '../files/fun/dice.js';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('coin-flip')
        .setDescription('Flip a coin.')
        .addIntegerOption(option =>
            option.setName('faces')
            .setDescription('Number of faces the dice should have.')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(false))
        .addIntegerOption(option =>
            option.setName('count')
            .setDescription('Number of dice that should be thrown.')
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false)).toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return dice(interaction);
    }
}

export default command;