import { Embed } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types';
import { Message, MessageButton, MessageActionRow, MessageSelectMenu, CommandInteraction, MessageComponentInteraction, SelectMenuInteraction, EmojiIdentifierResolvable, TextBasedChannel, CollectorFilter, GuildMember } from 'discord.js';
import { findBestMatch } from 'string-similarity';
import guildsCfg from '../config/guildConfig.json' assert { type: 'json' };


export interface getOptionsCompareValues {
    min?: number;
    max?: number;
}

/**
 * Get similar options from an input.
 * @param input Input to get the best matches from.
 * @param options An array of all possible options for the input.
 * @param compareValues Min and max match accuracy.
 * @returns Possible options for the input order by similarity, if any.
 */
export function getOptions (input: string, options: string[], { min = 0.3, max = 0.8 }: getOptionsCompareValues = {}): string[] {
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


export interface UserSelectOptions {
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    data: UserSelectOptionsOption[];
}

export interface UserSelectOptionsOption {
    label: string;
    description?: string;
    emoji?: EmojiIdentifierResolvable;
}

/**
 * Get user selection(s) of a list of options.
 * @param message The message to add the select to.
 * @param options Options for the select menu.
 * @returns An array of selected values.
 */
export async function userSelect (message: Message | CommandInteraction, options: UserSelectOptions): Promise<number[]> {
    options.minValues ??= 1;
    options.maxValues ??= 1;
    const guildCfg = (guildsCfg as any)[message.guildId ?? ''] ?? guildsCfg.default;
    const PAGE_LENGTH = 25;
    let currPage = 0,
        maxPage = Math.floor(options.data.length / 25),
        pages: (UserSelectOptionsOption & { value: string})[][] = [],
        componentMessage: Message;

    // create option bundles of lenth PAGE_LENGTH
    for (let i=0; i <= maxPage; i++)
        pages.push(options.data.slice(i*PAGE_LENGTH, (i+1)*PAGE_LENGTH).map((option, index) => { 
            return { 
                label: option.label, 
                value: `${currPage * PAGE_LENGTH + index}`, 
                description: option.description, 
                emoji: option.emoji 
            } 
        }));

    // create message components
    let prevButton = new MessageButton()
        .setCustomId('previous')
        .setEmoji('◀️')
        .setStyle('SECONDARY')
        .setDisabled(true);
    let nextButton = new MessageButton()
        .setCustomId('next')
        .setEmoji('▶️')
        .setStyle('SECONDARY');
    let doneButton = new MessageButton()
        .setCustomId('done')
        .setEmoji('✅')
        .setStyle('SUCCESS');
    let selectMenu = new MessageSelectMenu()
        .setCustomId('options')
        .setPlaceholder(options.placeholder ?? 'Select your desired option(s)')
        .setOptions(pages[currPage])
        .setMinValues(options.minValues)
        .setMaxValues(options.maxValues);
    const buttonRow = new MessageActionRow().setComponents(prevButton, nextButton, doneButton);
    const selectRow = new MessageActionRow().setComponents(selectMenu);

    // add components to interaction / message
    const infoEmbed: APIEmbed = {
        description: `Select ${options.minValues} to ${options.maxValues} items.`,
        color: guildCfg.embeds.info
    };
    const selectionEmbed = new Embed()
        .setTitle('Selections:')
        .setColor(guildCfg.embeds.waiting);
    if (message instanceof CommandInteraction)
        if (message.deferred || message.replied)
            componentMessage = (await message.fetchReply()) as Message;
        else
            componentMessage = (await message.deferReply({ fetchReply: true })) as Message;
    else
        componentMessage = message;
    await componentMessage.edit({ content: null, embeds: [infoEmbed, selectionEmbed], components: (maxPage > 0 ? [buttonRow, selectRow] : [selectRow]) });
    // get user seleted option(s)
    let values: number[] = [];
    const userId = (message instanceof CommandInteraction ? message.user.id : message.author.id);
    const filter = componentFilter({ users: [userId] });
    while (true) {
        const interaction = await componentMessage.awaitMessageComponent({ filter, time: 30_000 }).catch(reason => {
            const errorEmbed: APIEmbed = {
                description: `Failed to select options in time.`,
                color: guildCfg.embeds.error
            };
            componentMessage.edit({ embeds: [errorEmbed], components: [] });
            throw 'Failed to select in time.';
        });
        switch (interaction.customId) {
            case ('previous'):
                if (--currPage < 0) {
                    currPage = 0;
                    prevButton.setDisabled(true);
                }
                nextButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage]);
                componentMessage.edit({ embeds: [infoEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('next'):
                if (++currPage > maxPage) {
                    currPage = maxPage;
                    nextButton.setDisabled(true);
                }
                prevButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage]);
                componentMessage.edit({ embeds: [infoEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('done'):
                if (values.length > options.maxValues) {
                    values = [];
                    prevButton.setDisabled(true);
                    nextButton.setDisabled(false);
                    selectMenu.setOptions(pages[0]);
                    selectionEmbed.setDescription('');
                    const errorEmbed: APIEmbed = {
                        description: `Too many items selected. Selection has been reset.`,
                        color: guildCfg.embeds.warning
                    };
                    componentMessage.edit({ embeds: [errorEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                
                } else if (values.length < options.minValues) {
                    const errorEmbed: APIEmbed = {
                        description: `Not enough items selected. Please select the minimum amount required.`,
                        color: guildCfg.embeds.warning
                    };
                    componentMessage.edit( { embeds: [errorEmbed, selectionEmbed] });
                } else {
                    const confirmEmbed: APIEmbed = {
                        description: `Received selection.`,
                        color: guildCfg.embeds.success
                    };
                    componentMessage.edit({ embeds: [confirmEmbed, selectionEmbed], components: [] });
                    return values;
                }
            case ('options'):
                const selectValues = (interaction as SelectMenuInteraction).values;
                selectionEmbed.setDescription(selectionEmbed.description + '\n' 
                    + pages[currPage]
                        .filter(option => selectValues.includes(option.value) && !values.includes(parseInt(option.value)))
                        .map((elem, index) => `${values.length + index + 1}: ${elem.label}`)
                        .join('\n'));
                for (const value of selectValues)
                    if (!values.includes(parseInt(value)))
                        values.push(parseInt(value));
                if (values.length > options.maxValues) {
                    values = [];
                    prevButton.setDisabled(true);
                    nextButton.setDisabled(false);
                    selectMenu.setOptions(pages[0]);
                    selectionEmbed.setDescription('');
                    const errorEmbed: APIEmbed = {
                        description: `Too many items selected. Selection has been reset.`,
                        color: guildCfg.embeds.warning
                    };
                    componentMessage.edit({ embeds: [errorEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                    break;
                }
                if (pages.length == 1 && values.length >= options.minValues) {
                    const confirmEmbed: APIEmbed = {
                        description: `Received selection.`,
                        color: guildCfg.embeds.success
                    };
                    componentMessage.edit({ embeds: [confirmEmbed, selectionEmbed], components: [] });
                    return values;
                }
                componentMessage.edit({ embeds: [infoEmbed, selectionEmbed] });
                break;
        }
    }
}


/**
 * Gets a desired amount of options from UserSelectOptions.
 * @param optionsName The name of the options e.g. category.
 * @param interaction The interaction this option select belongs to.
 * @param options Options for the user select process.
 * @returns An array of user picked options in the range of minValue and maxValue of selectOptions.
 */
export async function getDesiredOptionLength(optionsName: string, interaction: CommandInteraction, options: UserSelectOptions): Promise<number[] | null> {
    options.minValues = options.minValues ?? 1;
    options.maxValues = options.maxValues ?? 1;
    const guildCfg = (guildsCfg as any)[interaction.guildId ?? ''] ?? guildsCfg.default;

    if (options.data.length < options.minValues) {
        const embed = new Embed()
            .setDescription(`No ${optionsName} found for your input.`)
            .setColor(guildCfg.embeds.error);
        if (interaction.replied || interaction.deferred)
            interaction.editReply({ embeds: [embed] });
        else
            interaction.reply({ embeds: [embed] });
        return null;
    }
    if (options.data.length <= options.maxValues) {
        return options.data.map((_, index) => index);
    }
    try {
        const values = await userSelect(interaction, options);
        return values;
    } catch (err) {
        const embed = new Embed()
            .setDescription('Failed to select options.')
            .setColor(guildCfg.embeds.error);
        if (interaction.replied || interaction.deferred)
            interaction.editReply({ content: null, embeds: [embed] });
        else
            interaction.reply({ content: null, embeds: [embed] });
        return null;
    }
}


export interface SelectShowcaseOption {
    dense: { [key: string]: string },
    verbose: { 
        description?: { [key: string]: string },
        footer?: { [key: string]: string },
        image?: string,
        thumbnail?: string,
        link?: string
    }
}

/**
 * Adds a showcase to an interaction. Resolves when the user clicked done. If the user clicked done while in the dense view
 * the index of the first option visible in the dense view will be returned.
 * @param interaction The interaction to add the showcase to.
 * @param options The showcase data that can be displayed.
 * @returns The index of the selected option.
 */
export async function selectShowcase(interaction: CommandInteraction, options: SelectShowcaseOption[]): Promise<number> {
    const guildCfg = (guildsCfg as any)[interaction.guildId ?? ''] ?? guildsCfg.default;

    const mappedOptions = options.map(option => { 
        return { 
            dense: `*${Object.values(option.dense).join(' - ')}*`,
            verbose: {
                description: option.verbose.description ? Object.values(option.verbose.description).map(arr => `${arr[0]}: *${arr[1]}*`).join('\n') : undefined,
                image: option.verbose.image,
                thumbnail: option.verbose.thumbnail,
                footer: option.verbose.footer ? Object.values(option.verbose.footer).map(arr => `${arr[0]}: ${arr[1]}`).join(' | ') : undefined,
                link: option.verbose.link
            }
        };
    });
    const DENSE_LENGTH = 5;
    let currItem = 0;

    if (options.length <= 1) return 0;

    const prevFiveButton = new MessageButton()
        .setCustomId('prevFive')
        .setStyle('PRIMARY')
        .setEmoji('⏪')
        .setDisabled(true);
    const prevOneButton = new MessageButton()
        .setCustomId('prevOne')
        .setStyle('PRIMARY')
        .setEmoji('◀️')
        .setDisabled(true);
    const doneButton = new MessageButton()
        .setCustomId('done')
        .setStyle('SUCCESS')
        .setEmoji('✅')
    const nextOneButton = new MessageButton()
        .setCustomId('nextOne')
        .setStyle('PRIMARY')
        .setEmoji('▶️');
    const nextFiveButton = new MessageButton()
        .setCustomId('nextFive')
        .setStyle('PRIMARY')
        .setEmoji('⏩')
    const denseButton = new MessageButton()
        .setCustomId('dense')
        .setStyle('PRIMARY')
        .setLabel('Dense View')
    const verboseButton = new MessageButton()
        .setCustomId('verbose')
        .setStyle('PRIMARY')
        .setLabel('Verbose view')
        .setDisabled(true);
    const embed = new Embed()
        .setTitle('Showcase')
        .setDescription(mappedOptions.slice(0, DENSE_LENGTH).map(page => page.dense).join('\n'))
        .setColor(guildCfg.embeds.info);

    const selectRow = new MessageActionRow().setComponents(prevFiveButton, prevOneButton, doneButton, nextOneButton, nextFiveButton);
    const viewRow = new MessageActionRow().setComponents(denseButton, verboseButton);

    let interactionMessage: Message;
    if (interaction.replied || interaction.deferred)
        interactionMessage = (await interaction.editReply({ content: null, embeds: [embed] })) as Message;
    else
        interactionMessage = (await interaction.reply({ embeds: [embed], fetchReply: true })) as Message;
    const componentMessage = (await interaction.followUp({ content: '.', components: [selectRow, viewRow] })) as Message;

    const filter = componentFilter({ users: [interaction.user.id] });
    const startDate = Date.now();
    let dense = true;
    while (true) {
        if (Date.now() - startDate > 600_000) {
            const errorEmbed: APIEmbed = {
                description: `Showcase has been going on for too long.`,
                color: guildCfg.embeds.error
            };
            interactionMessage.edit( { embeds: [errorEmbed] });
            throw 'showcase going too long';
        }
        let buttonInteraction;
        try {
            buttonInteraction = await componentMessage.awaitMessageComponent({ filter, time: 60_000 });
        } catch (_error) {
            interactionMessage.edit({ embeds: [embed] });
            componentMessage.edit({ content: (!dense && mappedOptions[currItem].verbose.link ? mappedOptions[currItem].verbose.link : '.')});
            return currItem;
        }

        if (buttonInteraction.customId.startsWith('prev')) {
            if ((currItem -= (buttonInteraction.customId === 'prevFive' ? 5 : 1) * (dense ? DENSE_LENGTH : 1)) <= 0) {
                currItem = 0;
                prevFiveButton.setDisabled(true);
                prevOneButton.setDisabled(true);
            }
            if ([currItem + (dense ? DENSE_LENGTH : 1)]) {
                nextFiveButton.setDisabled(false);
                nextOneButton.setDisabled(false);
            }
        }
        else if (buttonInteraction.customId.startsWith('next')) {
            if ((currItem += (buttonInteraction.customId === 'nextFive' ? 5 : 1) * (dense ? DENSE_LENGTH : 1)) >= mappedOptions.length - (dense ? DENSE_LENGTH + 1 : 1)) {
                if (currItem >= mappedOptions.length - 1)
                    currItem = mappedOptions.length - 1;
                nextOneButton.setDisabled(true);
                nextFiveButton.setDisabled(true);
            }
            prevFiveButton.setDisabled(false);
            prevOneButton.setDisabled(false);
        }
        else if (buttonInteraction.customId === 'dense') {
            denseButton.setDisabled(true);
            verboseButton.setDisabled(false);
            if (!mappedOptions[currItem + DENSE_LENGTH]) {
                nextOneButton.setDisabled(true);
                nextFiveButton.setDisabled(true);
            }
        }
        else if (buttonInteraction.customId === 'verbose') {
            verboseButton.setDisabled(true);
            denseButton.setDisabled(false);
            if (mappedOptions[currItem + 1]) {
                nextOneButton.setDisabled(false);
                nextFiveButton.setDisabled(false);
            }
        }
        else {
            embed.setColor(guildCfg.embeds.success);
            interactionMessage.edit({ embeds: [embed] });
            componentMessage.edit({ content: mappedOptions[currItem].verbose.link, components: [] });
            return currItem;
        }
        if (dense) {
            embed.setDescription(mappedOptions.slice(currItem, currItem + DENSE_LENGTH).map(option => option.dense).join('\n'));
            embed.setImage(null);
            embed.setThumbnail(null);
            embed.setFooter(null);
        }
        else {
            const embedCfg = mappedOptions[currItem].verbose;
            embed.setDescription(embedCfg.description ?? null);
            embed.setImage(embedCfg.description ?? null);
            embed.setThumbnail(embedCfg.thumbnail ?? null);
            embed.setFooter({ text: embedCfg.footer ?? "" });
        }
        interactionMessage.edit({ embeds: [embed] });
        componentMessage.edit({ content: (!dense && mappedOptions[currItem].verbose.link ? mappedOptions[currItem].verbose.link : '.'), components: [selectRow, viewRow] });
    }
}


export interface DecisionOptions {
    guildId?: string,
    approvalNumber?: number,
    userWhitelist?: string[],
    roleWhitelist?: string[],
    time?: number,
    trueOnTie?: boolean
}

/**
 * Sends a message with the decision and waits for users to accept or dimiss it.
 * @param channel The channel to create the decision in.
 * @param decision The decision text to vote on.
 * @param options The Options for the collector.
 * @returns A boolean indicating whether the decision got accepted or not.
 */
export async function userDecision(channel: TextBasedChannel, decision: string, options: DecisionOptions = {}): Promise<boolean> {
    options.trueOnTie ??= true;
    options.guildId ??= "default";
    options.approvalNumber ??= 1;
    let accepts = 0;
    let dismisses = 0;
    let acceptUsers: string[] = [];
    let dismissUsers: string[] = [];
    const guildCfg = (guildsCfg as any)[options.guildId] ?? guildsCfg.default;
    const embed = new Embed().setColor(guildCfg.embeds.info)
        .setDescription(decision)
        .setFooter({ text: "accepts: 0 | dismisses: 0" });
    const acceptButton = new MessageButton().setCustomId('accept').setEmoji('✅').setStyle('SUCCESS');
    const denyButton = new MessageButton().setCustomId('accept').setEmoji('❌').setStyle('DANGER');
    const message = await channel.send({ embeds: [embed], components: [new MessageActionRow().setComponents(acceptButton, denyButton)]});
    const collector = message.createMessageComponentCollector({ filter: componentFilter({ users: options.userWhitelist, roles: options.roleWhitelist }), time: options.time ?? 1_800_000 });
    collector.on('collect', interaction => {
        if (interaction.customId == 'accept' && !acceptUsers.includes(interaction.user.id)) {
            accepts++;
            if (dismissUsers.includes(interaction.user.id)) {
                dismissUsers.splice(dismissUsers.indexOf(interaction.user.id), 1);
                dismisses--;
            }
            embed.setFooter({ text: `accepts: ${accepts} | dismisses: ${dismisses}`});
            message.edit({ embeds: [embed] });
        }
        else if(interaction.customId == 'dismiss' && !dismissUsers.includes(interaction.user.id)) {
            dismisses++;
            if (acceptUsers.includes(interaction.user.id)) {
                acceptUsers.splice(acceptUsers.indexOf(interaction.user.id), 1);
                accepts--;
            }
            embed.setFooter({ text: `accepts: ${accepts} | dismisses: ${dismisses}`});
            message.edit({ embeds: [embed] });
        }
        if (accepts + dismisses >= (options.approvalNumber as number))
            collector.stop("limit");
    });
    return new Promise((resolve, _reject) => {
        collector.once('end', (_collected, reason) => {
            if (reason == "time") {
                message.edit({ embeds: [{ color: guildCfg.embeds.error, description: "Not enough people made a decision in time." }] });
                resolve(false);
            }
            if (accepts > dismisses) {
                message.edit({ embeds: [{ color: guildCfg.embeds.success, description: `Decision greenlighted with **${accepts}** to ${dismisses} votes.` }] });
                resolve(true);
            }
            if (accepts < dismisses) {
                message.edit({ embeds: [{ color: guildCfg.embeds.error, description: `Decision denied with **${accepts}** to ${dismisses} votes.` }] });
                resolve(false);
            }
            message.edit({ embeds: [{ color: options.trueOnTie ? guildCfg.embeds.success : guildCfg.embeds.error, 
                description: `Decision ${options.trueOnTie ? "greenlighted" : "denied"} with a tie of **${accepts}** to ${dismisses} votes.` }] });
            resolve(!!options.trueOnTie);
        });
    });
}


export interface ModDecisionOptions {
    time?: number,
    approvalNumber?: number
}

/**
 * Sends a message with the decision and waits for moderators to accept or dimiss it.
 * @param channel The channel to create the decision in.
 * @param decision The decision text to vote on.
 * @param options The Options for the collector.
 * @returns A boolean indicating whether the decision got accepted or not.
 */
export async function modDecision(channel: TextBasedChannel, decision: string, options: ModDecisionOptions = {}): Promise<boolean> {
    if (channel.type === "DM") return userDecision(channel, decision);
    const guildCfg = (guildsCfg as any)[channel.guildId] ?? guildsCfg.default;
    const roles: string[] = guildCfg.features.moderation;
    return userDecision(channel, decision, {...options, guildId: channel.guildId, roleWhitelist: roles });
}


export interface ComponentFilterOptions {
    users?: string[],
    roles?: string[]
}

/**
 * Creates and returns a component filter to use in a component collector.
 * @param options Options for the component filter.
 * @returns A component filter to use in a component collector.
 */
export function componentFilter(options: ComponentFilterOptions = {}): CollectorFilter<[MessageComponentInteraction]> {
    return async (component: MessageComponentInteraction): Promise<boolean> => {
        if (!options.users && !options.roles) return true;
        let inUsers = !options.users || options.users.includes(component.user.id);
        if (!options.roles || !component.inGuild()) return inUsers;
        const member = component.member as GuildMember;
        let inRoles = member.roles.cache.hasAny(...options.roles);
        if (options.users) return inUsers || inRoles;
        return inRoles;
    }
}