import { GuildMember, PartialGuildMember } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default async function guildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
    const guildCfg = (guildsCfg as any)[newMember.guild.id] ?? guildsCfg.default;
    if (!guildCfg?.features?.autoRoles) return;
    if (oldMember.pending !== newMember.pending)
        newMember.roles.add(guildCfg?.features?.autoRoles);
}