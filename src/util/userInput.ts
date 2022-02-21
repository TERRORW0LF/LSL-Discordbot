import { Embed } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types';
import { Message, MessageButton, MessageActionRow, MessageSelectMenu, CommandInteraction, MessageComponentInteraction, SelectMenuInteraction, EmojiIdentifierResolvable, TextBasedChannel, CollectorFilter, GuildMember, Collection } from 'discord.js';
import { findBestMatch } from 'string-similarity';
import guildsCfg from '../config/guildConfig.json';


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
    const guildCfg = (guildsCfg as any)[message.guildId ?? 'default'];
    const PAGE_LENGTH = 25;
    let currPage = 0,
        maxPage = Math.floor(options.data.length / 25),
        pages: (UserSelectOptionsOption & { value: string})[][] = [],
        componentMessage: Message;

    // create option bundles of lenth PAGE_LENGTH
    for (let i=0; i++ ; i <= maxPage)
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

    // add components to interaction / message
    const infoEmbed: APIEmbed = {
        description: `Select ${options.minValues} to ${options.maxValues} items.`,
        color: guildCfg.embeds.info
    };
    const selectionEmbed = new Embed()
        .setTitle('Selections:')
        .setColor(guildCfg.embeds.warning);
    if (message instanceof CommandInteraction)
        if (message.deferred || message.replied)
            componentMessage = (await message.fetchReply()) as Message;
        else
            componentMessage = (await message.deferReply({ fetchReply: true })) as Message;
    else
        componentMessage = message;
    await componentMessage.edit({ content: '', embeds: [infoEmbed, selectionEmbed], components: pages.length > 1 ? [buttonRow, new MessageActionRow().setComponents(selectMenu)] : [new MessageActionRow().setComponents(selectMenu)] });
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
                if (--currPage > maxPage) {
                    currPage = maxPage;
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
    const guildCfg = (guildsCfg as any)[interaction.guildId ?? 'default'];

    if (options.data.length < options.minValues) {
        const embed = new Embed()
            .setDescription(`No ${optionsName} found for your input.`)
            .setColor(guildCfg.embeds.error);
        interaction.editReply({ embeds: [embed] });
        throw 'Not enough options provided.';
    }
    if (options.data.length <= options.maxValues) {
        return options.data.map((_, index) => index);
    }
    try {
        const values = await userSelect(interaction, options)
        return values;
    } catch (err) {
        const embed = new Embed()
            .setDescription('Failed to select options.')
            .setColor(guildCfg.embeds.error);
        interaction.editReply({ embeds: [embed] });
        return null;
    }
}


export interface SelectShowcaseOption {
    dense: { [key: string]: string },
    verbose: { [key: string]: string }
}

export async function selectShowcase(interaction: CommandInteraction, options: SelectShowcaseOption[]): Promise<number> {
    const guildCfg = (guildsCfg as any)[interaction.guildId ?? 'default'];

    const mappedOptions = options.map(option => { 
        return { 
            dense: Object.values(option.dense).join(' - '),
            verbose: Object.entries(option.verbose).map(arr => `${arr[0]}: *${arr[1]}*`).join('\n')
        }
    });
    const PAGE_LENGTH = 5;
    const maxPage = Math.floor(options.length / PAGE_LENGTH);
    const pages: { dense: string, verbose: string}[][] = [];
    for (let i = 0; i <= maxPage; i++)
        pages.push(mappedOptions.slice(i * PAGE_LENGTH, (i + 1) * PAGE_LENGTH));
    let currPage = 0;

    if (options.length === 1) return 0;

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
        .setDescription(pages[currPage].join('\n'));

    const selectRow = new MessageActionRow().setComponents(prevFiveButton, prevOneButton, doneButton, nextOneButton, nextFiveButton);
    const viewRow = new MessageActionRow().setComponents(denseButton, verboseButton);

    let interactionMessage: Message;
    if (interaction.replied || interaction.deferred)
        interactionMessage = (await interaction.editReply({ embeds: [embed], components: [selectRow, viewRow] })) as Message;
    else
        interactionMessage = (await interaction.reply({ embeds: [embed], components: [selectRow, viewRow], fetchReply: true })) as Message;
    
    const filter = componentFilter({ users: [interaction.user.id] });
    const startDate = Date.now();
    while (true) {
        if (Date.now() - startDate > 600_000) {
            const errorEmbed: APIEmbed = {
                description: `Showcase has been going on for too long.`,
                color: guildCfg.embeds.error
            };
            interactionMessage.edit( { embeds: [errorEmbed] });
            throw 'showcase going too long';
        }
        const buttonInteraction = await interactionMessage.awaitMessageComponent({ filter, time: 60_000 }).catch(reason => {
            const errorEmbed: APIEmbed = {
                description: `Failed to select options in time.`,
                color: guildCfg.embeds.error
            };
            interactionMessage.edit({ embeds: [errorEmbed], components: [] });
            throw 'Failed to select in time.';
        });

        switch(buttonInteraction.customId) {
            case 'prevFive':
                break;
            case 'prevOne':
                break;
            case 'done':
                break;
            case 'nextOne':
                break;
            case 'nextFive':
                break;
            case 'dense':
                break;
            case 'verbose':
                break;
        }
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
    const guildCfg = (guildsCfg as any)[options.guildId];
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
            embed.setFooter({ text: `accepts: ${accepts} | dismisse: ${dismisses}`});
            message.edit({ embeds: [embed] });
        }
        else if(interaction.customId == 'dismiss' && !dismissUsers.includes(interaction.user.id)) {
            dismisses++;
            if (acceptUsers.includes(interaction.user.id)) {
                acceptUsers.splice(acceptUsers.indexOf(interaction.user.id), 1);
                accepts--;
            }
            embed.setFooter({ text: `accepts: ${accepts} | dismisse: ${dismisses}`});
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
    const guildCfg = (guildsCfg as any)[channel.guildId];
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