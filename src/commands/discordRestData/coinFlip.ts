import { SlashCommandBuilder } from '@discordjs/builders';
import { run as coinFlip } from '../files/fun/coinFlip.js';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('coin-flip')
        .setDescription('Flip a coin.').toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return coinFlip(interaction);
    }
}

export default command;