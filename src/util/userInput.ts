import { Embed } from '@discordjs/builders';
import { Message, MessageButton, MessageActionRow, MessageSelectMenu, CommandInteraction, MessageComponentInteraction, SelectMenuInteraction } from 'discord.js';
import { findBestMatch } from 'string-similarity';
import { getOptionsCompareValues, UserSelectOptions, UserSelectOptionsOption } from '../../typings';
import guildsConfig from '../config/guildConfig.json';

/**
 * Get similar options from an input.
 * @param input Input to get the best matches from.
 * @param options An array of all possible options for the input.
 * @param compareValues Min and max match accuracy.
 * @returns Possible options for the input order by similarity, if any.
 */
function getOptions (input: string, options: string[], { min = 0.3, max = 0.8 }: getOptionsCompareValues = {}): string[] {
    if (!options || !options.length) throw new Error('no options defined.');
    const lowerCaseOptions = options.map(x => x.toLowerCase());
    const data = findBestMatch(input.toLowerCase(), lowerCaseOptions);
    if (data.bestMatch.rating >= max)
        return [options[data.bestMatchIndex]];

    data.ratings.sort((entry1, entry2) => entry2.rating - entry1.rating);
    let filteredOptions = [];
    for (const rating of data.ratings)
        if (rating.rating >= min)
            filteredOptions.push(options[lowerCaseOptions.indexOf(rating.target)]);

    return filteredOptions;
}

/**
 * Get user selection(s) of a list of options.
 * @param message The message to add the select to.
 * @param options Options for the select menu.
 * @returns An array of selected values.
 */
async function userSelect (message: Message | CommandInteraction, options: UserSelectOptions): Promise<string[]> {
    let currPage = 0,
        maxPage = Math.floor(options.data.length / 25),
        pages: UserSelectOptionsOption[][] = [],
        inputComponents: MessageActionRow[] = [];

    // create option bundles of lenth 25
    for (let i=0; i++ ; i <= maxPage)
        pages.push(options.data.slice(i*25, (i+1)*25));

    // create message components
    let prevButton = new MessageButton()
            .setCustomId('previous')
            .setEmoji('⬅️')
            .setStyle('PRIMARY')
            .setDisabled(true);
    let nextButton = new MessageButton()
            .setCustomId('next')
            .setEmoji('➡️')
            .setStyle('PRIMARY');
    let selectMenu = new MessageSelectMenu()
        .setCustomId('options')
        .setPlaceholder(options.placeholder ?? 'Select your desired option(s)')
        .setOptions(pages[currPage].map((option, index) => { return { label: option.label, value: `${currPage * 25 + index}`, description: option.description, emoji: option.emoji } }))
        .setMinValues(options.minValues ?? 1)
        .setMaxValues(options.maxValues ?? 1);
    if (options.data.length > 25)
        inputComponents.push(new MessageActionRow().setComponents(prevButton, nextButton));
    inputComponents.push(new MessageActionRow().setComponents(selectMenu));

    // add components to interaction / message
    let componentMessage: Message;
    if (message instanceof CommandInteraction) {
        if (message.deferred || message.replied) {
            componentMessage = (await message.fetchReply()) as Message;
            message.editReply({ components: inputComponents });
        }
        else {
            const embed = new Embed()
                .setDescription('Slection needed to move forward.')
                .setColor((guildsConfig as any)[message.guildId ?? 'default'].embedColors.info);
            componentMessage = (await message.reply({ embeds: [embed], components: inputComponents, fetchReply: true })) as Message;
        }
    } else {
        componentMessage = message;
        await componentMessage.edit({ components: inputComponents });
    }
    // get user seleted option(s)
    let userId = (message instanceof CommandInteraction ? message.user.id : message.author.id);
    const filter = (interaction: MessageComponentInteraction) => (interaction.customId === 'previous' || interaction.customId === 'next' || interaction.customId === 'options') && interaction.user.id === userId;
    while (true) {
        let interaction = await componentMessage.awaitMessageComponent({ filter, time: 30_000 });
        switch (interaction.customId) {
            case ('previous'):
                currPage--;
                if (currPage === 0) prevButton.setDisabled(true);
                nextButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage].map((option, index) => { return { label: option.label, value: `${currPage * 25 + index}`, description: option.description, emoji: option.emoji }}));
                componentMessage.edit({ components: [new MessageActionRow().setComponents(nextButton, prevButton), new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('next'):
                currPage++;
                if (currPage === maxPage) nextButton.setDisabled(true);
                nextButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage].map((option, index) => { return { label: option.label, value: `${currPage * 25 + index}`, description: option.description, emoji: option.emoji }}));
                componentMessage.edit({ components: [new MessageActionRow().setComponents(nextButton, prevButton), new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('options'):
                componentMessage.edit({ components: [] });
                return (interaction as SelectMenuInteraction).values;
        }
    }
}

export { getOptions, userSelect };