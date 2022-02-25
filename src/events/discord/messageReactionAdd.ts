import { Embed } from "@discordjs/builders";
import { APIEmbedField } from "discord-api-types";
import { Formatters, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User } from "discord.js";
import guildsCfg from '../../config/guildConfig.json' assert { type: json };

export default async function messageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
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
    if (!starMessage) {
        const fields: APIEmbedField[] = [];
        if (message.type === 'REPLY') {
            const channel = (await message.guild?.channels.fetch(message.reference?.channelId ?? '')) as TextChannel;
            const repliedMessage = await channel.messages.fetch(message.reference?.messageId ?? '');
            fields.push({ name: 'Replied to', value: repliedMessage.content, inline: false });
        }
        fields.push({ name: 'Source', value: Formatters.hyperlink('Jump!', message.url), inline: false });
        let attachment: string | null = null;
        if (message.attachments.size) {
            let attachmentUrl = message.attachments.first()?.url as string;
            if (/(jpg|jpeg|png|gif)/gi.test(attachmentUrl)) {
                fields.push({ name: 'Attachments', value: '\u2008', inline: false });
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
    await message.channel.send(`${guildCfg.features?.starboard?.emoji} ${count} ${Formatters.channelMention(message.channelId)}`);
}