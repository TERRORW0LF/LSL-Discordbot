import { Formatters, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: json };

export default async function messageReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    const message = await reaction.message.fetch();
    if (!message.guildId) return;
    const guildCfg = (guildsCfg as any)[message.guildId ?? ''] ?? guildsCfg.default;
    if (!guildCfg?.features?.starboard?.enabled) return;
    if (!guildCfg?.features?.starboard?.channel) return;
    if (reaction.emoji.name !== guildCfg?.features?.starbaoard?.emoji) return;
    if (!reaction.count) reaction = await reaction.fetch();
    const count = reaction.users.cache.has(message.author.id) ? reaction.count - 1 : reaction.count;
    if (count < guildCfg?.features?.starboard?.count) return;
    const starChannel = await message.guild?.channels.fetch(guildCfg?.features?.starboard?.channel) as TextChannel;
    const starredMessages = await starChannel.messages.fetch({ after: message.id, limit: 100 });
    const starMessage = starredMessages.find(message => message.embeds[0].footer?.text === message.id);
    if (!starMessage) return;
    await message.channel.send(`${guildCfg.features?.starboard?.emoji} ${count} ${Formatters.channelMention(message.channelId)}`);
}