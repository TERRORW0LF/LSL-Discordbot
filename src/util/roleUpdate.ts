import { Collection, Guild, GuildMember } from "discord.js";


/**
 * Gets a collection of members, only those members who are actually in the guild will be in the collection.
 * @param guild The guild to get the members from.
 * @param members The names of the members to get.
 * @returns A collection of members keyed by their name.
 */
export async function getMembersByName(guild: Guild, members: string[]): Promise<Collection<string, GuildMember>> {

}


/**
 * Gets a member of a guild by their name.
 * @param guild The guild to get the member from.
 * @param member The name of the member to get.
 * @returns A member or null if no matching member was found.
 */
export async function getMemberByName(guild: Guild, member: string): Promise<GuildMember | null> {

}


interface MemberWithPoints {
    memberName: string,
    points: number
}

/**
 * Updates the roles of the members according to their points.
 * @param guild The guild the members belong to.
 * @param data The members and their respective points.
 * @returns A boolean indicating whether all roles were applied.
 */
export async function roleUpdates(guild: Guild, data: MemberWithPoints[]): Promise<boolean> {

}