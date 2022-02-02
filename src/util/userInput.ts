import { Embed } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types';
import { Message, MessageButton, MessageActionRow, MessageSelectMenu, CommandInteraction, MessageComponentInteraction, SelectMenuInteraction, EmojiIdentifierResolvable, MessageReaction, User, TextBasedChannel, CollectorFilter, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { findBestMatch } from 'string-similarity';
import guildsConfig from '../config/guildConfig.json';

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
async function userSelect (message: Message | CommandInteraction, options: UserSelectOptions): Promise<number[]> {
    options.minValues ??= 1;
    options.maxValues ??= 1;
    const guildConfig = ((guildsConfig as any)[message.guildId ?? 'default'] ?? guildsConfig.default);
    const PAGE_LENGTH = 25;
    let currPage = 0,
        maxPage = Math.floor(options.data.length / 25),
        pages: (UserSelectOptionsOption & { value: string})[][] = [],
        componentMessage: Message;

    // create option bundles of lenth PAGE_LENGTH
    for (let i=0; i++ ; i <= maxPage)
        pages.push(options.data.slice(i*PAGE_LENGTH, (i+1)*PAGE_LENGTH)
                               .map((option, index) => { return { label: option.label, 
                                                                  value: `${currPage * PAGE_LENGTH + index}`, 
                                                                  description: option.description, 
                                                                  emoji: option.emoji } }));

    // create message components
    let prevButton = new MessageButton()
        .setCustomId('previous')
        .setEmoji('⬅️')
        .setStyle('SECONDARY')
        .setDisabled(true);
    let nextButton = new MessageButton()
        .setCustomId('next')
        .setEmoji('➡️')
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
    const infoEmbed = new Embed()
        .setDescription(`Select ${options.minValues} to ${options.maxValues} items.`)
        .setColor(guildConfig.embedColors.info);
    const selectionEmbed = new Embed()
        .setTitle('Selections:')
        .setColor(guildConfig.embedColors.warning);
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
    const filter = (interaction: MessageComponentInteraction) => (interaction.customId === 'previous' || interaction.customId === 'next' || interaction.customId === 'options') && interaction.user.id === userId;
    while (true) {
        const interaction = await componentMessage.awaitMessageComponent({ filter, time: 30_000 }).catch(reason => {
            const errorEmbed = new Embed()
                .setDescription('Failed to select options in time.')
                .setColor(guildConfig.embedColors.error);
            componentMessage.edit({ embeds: [errorEmbed], components: [] });
            throw 'Failed to select in time.';
        });
        switch (interaction.customId) {
            case ('previous'):
                currPage--;
                if (currPage === 0) prevButton.setDisabled(true);
                nextButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage]);
                componentMessage.edit({ components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('next'):
                currPage++;
                if (currPage === maxPage) nextButton.setDisabled(true);
                nextButton.setDisabled(false);
                selectMenu.setOptions(pages[currPage]);
                componentMessage.edit({ components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                break;
            case ('done'):
                if (values.length < options.minValues || values.length > options.maxValues) {
                    values = [];
                    selectMenu.setOptions(pages[0]);
                    selectionEmbed.setDescription('');
                    const errorEmbed = new Embed()
                        .setDescription('Not enough or too many items selected.\nSelection has been reset.')
                        .setColor(guildConfig.embedColors.warning);
                    componentMessage.edit({ embeds: [errorEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                } else
                    return values;
            case ('options'):
                const selectValues = (interaction as SelectMenuInteraction).values;
                selectionEmbed.setDescription(selectionEmbed.description + '\n' 
                    + pages[currPage].filter(option => selectValues.includes(option.value) && !values.includes(parseInt(option.value)))
                                     .map((elem, index) => `${values.length + index + 1}: ${elem.label}`)
                                     .join('\n'));
                for (const value of selectValues)
                    if (!values.includes(parseInt(value)))
                        values.push(parseInt(value));
                if (values.length > options.maxValues) {
                    values = [];
                    selectMenu.setOptions(pages[0]);
                    selectionEmbed.setDescription('');
                    const errorEmbed = new Embed()
                        .setDescription('Too many items selected.\nSelection has been reset.')
                        .setColor(guildConfig.embedColors.warning);
                    componentMessage.edit({ embeds: [errorEmbed, selectionEmbed], components: [buttonRow, new MessageActionRow().setComponents(selectMenu)] });
                    break;
                }
                if (values.length > options.minValues) {
                    const confirmEmbed = new Embed()
                        .setDescription('Received selection.')
                        .setColor(guildConfig.embedColors.success);
                    componentMessage.edit({ embeds: [confirmEmbed, selectionEmbed], components: [] });
                    return selectValues.map(str => parseInt(str));
                }
                if (pages.length == 1) {
                    const errorEmbed = new Embed()
                        .setDescription('Not enough items selected.')
                        .setColor(guildConfig.embedColors.error);
                        componentMessage.edit({ embeds: [errorEmbed], components: [] });
                        throw "Not enough selections.";
                }
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
async function getDesiredOptionLength(optionsName: string, interaction: CommandInteraction, options: UserSelectOptions): Promise<number[] | null> {
    options.minValues = options.minValues ?? 1;
    options.maxValues = options.maxValues ?? 1;
    const guildConfig = (guildsConfig as any)[interaction.guildId ?? 'default'];

    if (options.data.length < options.minValues) {
        const embed = new Embed()
            .setDescription(`No ${optionsName} found for your input.`)
            .setColor(guildConfig.embeds.error);
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
            .setColor(guildConfig.embedColors.error);
        interaction.editReply({ embeds: [embed] });
        return null;
    }
}


interface DecisionOptions {
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
async function userDecision(channel: TextBasedChannel, decision: string, options: DecisionOptions = {}): Promise<boolean> {
    options.trueOnTie ??= true;
    options.guildId ??= "default";
    options.approvalNumber ??= 1;
    let accepts = 0;
    let dismisses = 0;
    let acceptUsers: string[] = [];
    let dismissUsers: string[] = [];
    const guildConfig = (guildsConfig as any)[options.guildId];
    const embed = new Embed().setColor(guildConfig.embedColors.info)
        .setDescription(decision)
        .setFooter({ text: "accepts: 0 | dismisses: 0" });
    const acceptButton = new MessageButton().setCustomId('accept').setEmoji('✅').setStyle('SUCCESS');
    const denyButton = new MessageButton().setCustomId('accept').setEmoji('❌').setStyle('DANGER');
    const message = await channel.send({ embeds: [embed], components: [new MessageActionRow().setComponents(acceptButton, denyButton)]});
    const collector = message.createMessageComponentCollector({ filter: componentFilter({ users: options.userWhitelist, roles: options.roleWhitelist }), time: options.time ?? 1_800_000 });
    // TODO: Update to components, add accept / dismiss counter to footer.
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
    return new Promise((resolve, reject) => {
        collector.once('end', (_collected, reason) => {
            if (reason == "time") {
                message.edit({ embeds: [{ color: guildConfig.embedColors.error, description: "Not enough people made a decision in time." }] });
                resolve(false);
            }
            if (accepts > dismisses) {
                message.edit({ embeds: [{ color: guildConfig.embedColors.success, description: `Decision greenlighted with **${accepts}** to ${dismisses} votes.` }] });
                resolve(true);
            }
            if (accepts < dismisses) {
                message.edit({ embeds: [{ color: guildConfig.embedColors.error, description: `Decision denied with **${accepts}** to ${dismisses} votes.` }] });
                resolve(false);
            }
            message.edit({ embeds: [{ color: options.trueOnTie ? guildConfig.embedColors.success : guildConfig.embedColors.error, 
                description: `Decision ${options.trueOnTie ? "greenlighted" : "denied"} with a tie of **${accepts}** to ${dismisses} votes.` }] });
            resolve(!!options.trueOnTie);
        });
    });
}


interface ModDecisionOptions {
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
async function modDecision(channel: GuildTextBasedChannel, decision: string, options: ModDecisionOptions = {}): Promise<boolean> {
    const guildConfig = (guildsConfig as any)[channel.guildId];
    const roles: string[] = guildConfig.features.moderation;
    return userDecision(channel, decision, {...options, guildId: channel.guildId, roleWhitelist: roles });
}


interface ComponentFilterOptions {
    users?: string[],
    roles?: string[]
}

/**
 * Creates and returns a component filter to use in a component collector.
 * @param options Options for the component filter.
 * @returns A component filter to use in a component collector.
 */
function componentFilter(options: ComponentFilterOptions = {}): CollectorFilter<[MessageComponentInteraction]> {
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


export { getOptions, userSelect, getDesiredOptionLength, userDecision, modDecision, componentFilter };