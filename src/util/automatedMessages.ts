import guildsCfg from '../config/guildConfig.json';
import { Run } from "./sheets";
import { Client, Formatters } from 'discord.js';
import { APIEmbed } from 'discord-api-types';
import { getMemberByName } from './roleUpdate';


export async function sendSubmit(client: Client, guildId: string, submit: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;
    if (!guildCfg?.features?.submit?.enabled) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg.features.submit.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, submit.username);
    const name = member?.displayName ?? submit.username.split('#')[0];
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.avatarURL() ?? undefined },
        title: `New Submit by ${name}`,
        url: submit.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(submit.map)}.jpg`},
        description: `*patch:* ${submit.patch}\n*season*: ${submit.season}\n*category*: ${submit.category}\n*map*: ${submit.map}\n*time*: ${submit.time}\n*proof*: ${Formatters.hyperlink("link", submit.proof)}\n*date*: ${Formatters.time(submit.date, Formatters.TimestampStyles.ShortDateTime)}`,
        footer: { text: "" + submit.submitId }
    }
    await channel.send({ embeds: [embed] });
    channel.send(submit.proof);
}