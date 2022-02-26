import { GuildMember } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default async function(member: GuildMember) {
    const guildCfg = (guildsCfg as any)[member.guild.id] ?? guildsCfg.default;
    if (!guildCfg?.features?.autoRoles) return;
    if (member.pending) return;
    member.roles.add(guildCfg?.features?.autoRoles);
}