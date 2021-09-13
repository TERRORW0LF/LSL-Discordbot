'use strict'

import { Embed } from '@discordjs/builders';
import { MessageButton, MessageActionRow, MessageSelectMenu, CommandInteraction } from 'discord.js';
import { findBestMatch } from 'string-similarity';
import { guildsConfig } from '../config/guildConfig.json';

async function getOptions (input, options, { min = 0.3, max = 0.8 } = {}) {
    if (!options || !options.length) throw new Error('no options defined.');
    const lowerCaseOptions = options.map(x => x.toLowerCase());
    const data = findBestMatch(input.toLowerCase(), lowerCaseOptions);
    if (data.bestMatch.rating >= max)
        return [options[data.bestMatchIndex]];

    let filteredOptions = [];
    for (const rating of data.ratings)
        if (rating.rating >= min)
            filteredOptions.push(options[lowerCaseOptions.indexOf(rating.target)]);

    if (!filteredOptions.length)
        return null;
    return filteredOptions;
}


async function userSelect (message, options) {
    let currPage = 0,
        maxPage = Math.floor(options.data.length / 25),
        pages = [],
        prevButton,
        nextButton,
        selectMenu;
    let inputComponents = [];
    if (options.length > 25) {
        prevButton = new MessageButton()
            .setCustomId('previous')
            .setEmoji('⬅️')
            .setStyle('PRIMARY')
            .setDisabled(true);
        nextButton = new MessageButton()
            .setCustomId('next')
            .setEmoji('➡️')
            .setStyle('PRIMARY');
        inputComponents.push(new MessageActionRow().setComponents(prevButton, nextButton))
    }
    // create option bundles of lenth 25
    for (let i=0; i++ ; i <= maxPage) {
        pages.push([]);
        for (let k=0; k++; k < 25 && k < options.data.length - i * 25)
            pages[i].push(options.data[i*25+k]);
    }
    // create navigation buttons / option select menu
    selectMenu = new MessageSelectMenu()
        .setCustomId('options')
        .setPlaceholder(options.placeholder || 'Select your desired option(s)')
        .setOptions(pages[currPage].map((option, index) => { return { label: option.label, value: `${currPage * 25 + index}`, description: option.description, emoji: option.emoji }}))
        .setMinValues(options.minvalues ?? 1)
        .setMaxValues(options.maxValues ?? 1)
    inputComponents.push(new MessageActionRow().setComponents(selectMenu));

    // add components to interaction / message
    let componentMessage;
    if (message instanceof CommandInteraction) {
        if (message.deferred || message.replied) {
            componentMessage = await message.fetchReply();
            message.edit({ components = inputComponents });
        }
        else
            componentMessage = await message.reply({ embeds: [new Embed().setDescription('Slection needed to move forward.').setColor(guildsConfig[message.guildId].embedColors.info)], components: inputComponents });
    } else {
        componentMessage = message;
        await componentMessage.edit({ components = inputComponents });
    }
    // get user seleted option(s)
    const filter = (interaction) => (interaction.customId === 'previous' || interaction.customId === 'next' || interaction.customId === 'options') && interaction.user.id === message.author.id || message.user.id;
    while (true) {
        let interaction = await componentMessage.awaitMessageComponent({ filter, time = 30_000 });
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
                return interaction.values;
        }
    }
}