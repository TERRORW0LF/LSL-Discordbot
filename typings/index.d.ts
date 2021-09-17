import { SlashCommandBuilder } from "@discordjs/builders";
import { EmojiIdentifierResolvable, Interaction } from "discord.js";

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

export interface ApplicationCommandExecuter {
    data: SlashCommandBuilder,
    execute(interaction: Interaction): Promise<void>; 
}

export interface getOptionsCompareValues {
    min?: number;
    max?: number;
}