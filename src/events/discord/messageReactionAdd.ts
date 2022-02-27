import { Embed } from "@discordjs/builders";
import { APIEmbedField } from "discord-api-types";
import { Formatters, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: 'json' };

export default async function messageReactionAdd(reaction: MessageReaction | PartialMessageReaction, _user: User | PartialUser): Promise<void> {
    const message = await reaction.message.fetch();
    if (!message.guildId) return;
    const guildCfg = (guildsCfg as any)[message.guildId ?? ''] ?? guildsCfg.default;
    if (!guildCfg?.features?.starboard?.enabled) return;
    if (!guildCfg?.features?.starboard?.channel) return;
    if (reaction.emoji.name !== guildCfg?.features?.starboard?.emoji) return;
    if (!reaction.count) reaction = await reaction.fetch();
    const count = (await reaction.users.fetch()).has(message.author.id) ? reaction.count - 1 : reaction.count;
    if (count < guildCfg?.features?.starboard?.count) return;
    const starChannel = await message.guild?.channels.fetch(guildCfg?.features?.starboard?.channel) as TextChannel;
    const [afterStarredMessages, lastStarredMessages] = await Promise.all([
        await starChannel.messages.fetch({ after: message.id, limit: 100 }),
        await starChannel.messages.fetch({ limit: 100 })
    ]);
    const starredMessages = afterStarredMessages.concat(lastStarredMessages);
    const starMessage = starredMessages.find(message1 => message1.embeds[0]?.footer?.text === message.id);
    if (!starMessage) {
        const fields: APIEmbedField[] = [];
        if (message.type === 'REPLY') {
            const channel = (await message.channel.fetch()) as TextChannel;
            const repliedMessage = await channel.messages.fetch(message.reference?.messageId ?? '');
            fields.push({ name: 'Replied to', value: repliedMessage.content, inline: false });
        }
        fields.push({ name: 'Source', value: Formatters.hyperlink('Jump!', message.url), inline: false });
        let attachment: string | null = null;
        if (message.attachments.size) {
            let attachmentUrl = message.attachments.first()?.url as string;
            if (/(jpg|jpeg|png|gif)/gi.test(attachmentUrl)) {
                fields.push({ name: 'Attachments', value: '\u200B', inline: false });
                attachment = attachmentUrl;
            }
        }
        const embed = new Embed()
            .setAuthor({
                name: message.member?.nickname ?? message.author.username,
                iconURL: message.member?.displayAvatarURL({ dynamic: false })
            })
            .setDescription(message.content)
            .addFields(...fields)
            .setImage(attachment)
            .setColor(guildCfg.embeds.success)
            .setFooter({ text: message.id })
            .setTimestamp();
        const starChannel = await message.guild?.channels.fetch(guildCfg.features?.starboard?.channel) as TextChannel;
        await starChannel.send({ content: `${guildCfg.features?.starboard?.emoji} ${count} ${Formatters.channelMention(message.channelId)}`, embeds: [embed] });
        return;
    }
    await starMessage.edit(`${guildCfg.features?.starboard?.emoji} ${count} ${Formatters.channelMention(message.channelId)}`);
}