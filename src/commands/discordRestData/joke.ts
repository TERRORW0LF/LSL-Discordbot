import { SlashCommandBuilder } from '@discordjs/builders';
import { run as joke } from '../files/fun/joke.js';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('coin-flip')
        .setDescription('Flip a coin.').toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return joke(interaction);
    }
}

export default command;