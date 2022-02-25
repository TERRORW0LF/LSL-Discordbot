import { Collection, Message, MessageReaction, PartialMessage, TextChannel } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: json };

export default async function messageReactionRemoveAll(message: Message<boolean> | PartialMessage, _reactions: Collection<string, MessageReaction>) {
    message = await message.fetch();
    if (!message.guildId) return;
    const guildCfg = (guildsCfg as any)[message.guildId ?? ''] ?? guildsCfg.default;
    if (!guildCfg?.features?.starboard?.enabled) return;
    if (!guildCfg?.features?.starboard?.channel) return;
    const starChannel = await message.guild?.channels.fetch(guildCfg?.features?.starboard?.channel) as TextChannel;
    const starredMessages = await starChannel.messages.fetch({ after: message.id, limit: 100 });
    const starMessage = starredMessages.find(message => message.embeds[0].footer?.text === message.id);
    if (!starMessage) return;
    starMessage.delete();
}