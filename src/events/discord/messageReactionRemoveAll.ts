import { Collection, Message, MessageReaction, PartialMessage, TextChannel } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default async function messageReactionRemoveAll(message: Message<boolean> | PartialMessage, _reactions: Collection<string, MessageReaction>): Promise<void> {
    message = await message.fetch();
    if (!message.guildId) return;
    const guildCfg = (guildsCfg as any)[message.guildId ?? ''] ?? guildsCfg.default;
    if (!guildCfg?.features?.starboard?.enabled) return;
    if (!guildCfg?.features?.starboard?.channel) return;
    const starChannel = await message.guild?.channels.fetch(guildCfg?.features?.starboard?.channel) as TextChannel;
    const [afterStarredMessages, lastStarredMessages] = await Promise.all([
        await starChannel.messages.fetch({ after: message.id, limit: 100 }),
        await starChannel.messages.fetch({ limit: 100 })
    ]);
    const starredMessages = afterStarredMessages.concat(lastStarredMessages);
    const starMessage = starredMessages.find(message1 => message1.embeds[0]?.footer?.text === message.id);
    if (!starMessage) return;
    starMessage.delete();
}