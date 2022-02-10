import guildsConfig from "../config/guildConfig.json";
import { Collection, Guild, GuildMember } from "discord.js";
import { Points } from "./sheets";


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
 * @returns A boolean indicating whether all roles were applied.
 */
export async function roleUpdates(guild: Guild, season: number, data: Collection<string, Points>): Promise<void> {
    const guildCfg = (guildsConfig as any)[guild.id];
    if (!guildCfg) return;

    const rolesObj = guildCfg.roles["" + season];
    const firstPlaceStandardRole = guildCfg.roles?.firstPlace["" + season].Standard;
    const firstPlaceGravspeedRole = guildCfg.roles?.firstPlace["" + season].Gravspeed;
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
        for (const role in roles)
            if (role != newRole && member.member.roles.cache.has(role)) {
                member.member.roles.remove(role);
                break;
            }
        if (newRole && !member.member.roles.cache.has(newRole))
            member.member.roles.add(newRole);
    }
    if (oldFirstPlaceStandard != newFirstPlaceStandard) {
        oldFirstPlaceStandard?.member.roles.remove(firstPlaceStandardRole);
        newFirstPlaceStandard?.member.roles.add(firstPlaceStandardRole);
    }
    if (oldFirstPlaceGravspeed != newFirstPlaceGravspeed) {
        oldFirstPlaceGravspeed?.member.roles.remove(firstPlaceGravspeedRole);
        newFirstPlaceGravspeed?.member.roles.add(firstPlaceGravspeedRole);
    }
}


function getRole(points: number, roles: Collection<number, string>): string | null {
    let nearestLowerRolePoints = 0;
    for (const point of roles.keys())
        if (nearestLowerRolePoints < point && point <= points)
            nearestLowerRolePoints = point;
    return nearestLowerRolePoints == 0 ? roles.get(nearestLowerRolePoints) as string : null;
}