import { GuildMember, PartialGuildMember } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default function guildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    const guildCfg = (guildsCfg as any)[newMember.guild.id] ?? guildsCfg.default;
    if (oldMember.pending !== newMember.pending)
        newMember.roles.add(guildCfg?.features?.autoRoles);
}