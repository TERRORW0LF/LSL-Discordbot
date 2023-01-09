import { SlashCommandBuilder } from '@discordjs/builders';
import { run as drops } from '../files/fun/drops.js';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandExecuter } from '../commandCollection.js';

const command: ApplicationCommandExecuter = {
    data: new SlashCommandBuilder()
        .setName('drops')
        .setDescription('OWL YouTube chat simulator.').toJSON(),
    async execute(interaction: CommandInteraction<'present'>): Promise<void> {
        return drops(interaction);
    }
}

export default command;