import { Collection, Guild, GuildMember } from "discord.js";
import { Points } from "./sheets.js";
import { sendRank } from "./automatedMessages.js";
import guildsCfg from '../config/guildConfig.json' assert { type: 'json' };


/**
 * Gets a collection of members, only those members who are actually in the guild will be in the collection.
 * @param guild The guild to get the members from.
 * @param members The names of the members to get.
 * @returns A collection of members keyed by their name.
 */
export async function getMembersByName(guild: Guild, members: string[]): Promise<Collection<string, GuildMember>> {
    return (await guild.members.fetch()).filter(member => members.includes(member.user.tag));
}


/**
 * Gets a member of a guild by their name.
 * @param guild The guild to get the member from.
 * @param member The name of the member to get.
 * @returns A member or null if no matching member was found.
 */
export async function getMemberByName(guild: Guild, member: string): Promise<GuildMember | null> {
    return (await guild.members.fetch({ query: member.split('#')[0], limit: 100 })).find(value => value.user.tag == member) ?? null;
}


export interface MemberWithPoints {
    member: GuildMember,
    points: Points
}

export type Category = "Gravspeed" | "Standard";

/**
 * Updates the roles of the members according to their points.
 * @param guild The guild the members belong to.
 * @param data The members and their respective points.
 */
export async function roleUpdates(guild: Guild, season: string, data: Collection<string, Points>): Promise<void> {
    const guildCfg = (guildsCfg as any)[guild.id];
    if (!guildCfg) return;

    const rolesObj = guildCfg.roles[season];
    const firstPlaceStandardRole = guildCfg.roles?.firstPlace[season].Standard;
    const firstPlaceGravspeedRole = guildCfg.roles?.firstPlace[season].Gravspeed;
    const roles = new Collection<number, string>();
    for (const role in rolesObj)
        roles.set(parseInt(role), rolesObj[role]);
    
    const members = await getMembersByName(guild, [...data.keys()]);
    let oldFirstPlaceStandard: MemberWithPoints | null = null;
    let newFirstPlaceStandard: MemberWithPoints | null = null;
    let oldFirstPlaceGravspeed: MemberWithPoints | null = null;
    let newFirstPlaceGravspeed: MemberWithPoints | null = null;
    let newFirstPlaceStandardPoints = 0;
    let newFirstPlaceGravspeedPoints = 0;
    for (const memberName of data.keys()) {
        let isNewFirstPlaceStandard = false;
        let isNewFirstPlaceGravspeed = false;
        if ((data.get(memberName) as Points).Standard > newFirstPlaceStandardPoints) {
            newFirstPlaceStandardPoints = (data.get(memberName) as Points).Standard;
            isNewFirstPlaceStandard = true;
        }
        if ((data.get(memberName) as Points).Gravspeed > newFirstPlaceGravspeedPoints) {
            newFirstPlaceGravspeedPoints = (data.get(memberName) as Points).Gravspeed;
            isNewFirstPlaceGravspeed = true;
        }
        const guildMember = members.find(member => member.user.tag === memberName);
        if (!guildMember) return;
        const member: MemberWithPoints = { member: guildMember, points: data.get(memberName) as Points };
        if (isNewFirstPlaceStandard)
            newFirstPlaceStandard = member;
        if (isNewFirstPlaceGravspeed)
            newFirstPlaceGravspeed = member;
        if (member.member.roles.cache.has(firstPlaceStandardRole))
            oldFirstPlaceStandard = member;
        if (member.member.roles.cache.has(firstPlaceGravspeedRole))
            oldFirstPlaceGravspeed = member;
        const newRole = getRole(Math.max(member.points.Standard, member.points.Gravspeed), roles);
        let oldRole: string | null = null;
        for (const role in roles)
            if (role != newRole && member.member.roles.cache.has(role)) {
                oldRole = role;
                member.member.roles.remove(role);
                break;
            }
        if (newRole && !member.member.roles.cache.has(newRole))
            member.member.roles.add(newRole);
        if (newRole != oldRole && guildCfg?.features?.announce?.rank?.enabled)
            sendRank(guild.client, guild.id, member.member, newRole ?? "", compareRoles(roles, oldRole, newRole))
    }
    if (oldFirstPlaceStandard && oldFirstPlaceStandard != newFirstPlaceStandard)
        oldFirstPlaceStandard?.member.roles.remove(firstPlaceStandardRole);
    if (newFirstPlaceStandard && !newFirstPlaceStandard.member.roles.cache.has(firstPlaceStandardRole)) {
        newFirstPlaceStandard?.member.roles.add(firstPlaceStandardRole);
        if (guildCfg?.features?.announce?.rank?.enabled)
            sendRank(guild.client, guild.id, newFirstPlaceStandard.member, firstPlaceStandardRole, true);
    }
    if (oldFirstPlaceGravspeed && oldFirstPlaceGravspeed != newFirstPlaceGravspeed)
        oldFirstPlaceGravspeed?.member.roles.remove(firstPlaceGravspeedRole);
    if (newFirstPlaceGravspeed && !newFirstPlaceGravspeed.member.roles.cache.has(firstPlaceGravspeedRole)) {
        newFirstPlaceGravspeed?.member.roles.add(firstPlaceGravspeedRole);
        if (guildCfg?.features?.announce?.rank?.enabled)
            sendRank(guild.client, guild.id, newFirstPlaceGravspeed.member, firstPlaceGravspeedRole, true);
    }
}


/**
 * Gets the role a user should have based on his points.
 * @param points The points the user has.
 * @param roles A Collections of all possible roles the user could get (key = required points, value = role id).
 * @returns The role id if the user should get a role, null otherwise.
 */
function getRole(points: number, roles: Collection<number, string>): string | null {
    let nearestLowerRolePoints = 0;
    for (const point of roles.keys())
        if (nearestLowerRolePoints < point && point <= points)
            nearestLowerRolePoints = point;
    return nearestLowerRolePoints == 0 ? roles.get(nearestLowerRolePoints) as string : null;
}


/**
 * Compares 2 roles by the points needed to get them, breaks if both roles are the same.
 * @param roles A collection of role ids keyed by the required points.
 * @param oldRole The old role id.
 * @param newRole The new rold id to compare against.
 * @returns True of the points required for the new role are higher than the points required for the old role, false otherwise.
 */
function compareRoles(roles: Collection<number, string>, oldRole: string | null, newRole: string | null): boolean {
    let oldPoints = 0;
    let newPoints = 0;
    for (const [key, entry] of roles) {
        if (entry == oldRole)
            oldPoints = key;
        if (entry == newRole)
            newPoints = key;
    }
    return oldPoints < newPoints;
}