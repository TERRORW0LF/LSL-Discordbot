import guildsCfg from '../config/guildConfig.json';
import { Run } from "./sheets";
import { Client, Formatters, GuildMember } from 'discord.js';
import { APIEmbed } from 'discord-api-types';
import { getMemberByName } from './roleUpdate';


/**
 * Sends the submit to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the submit to.
 * @param submit The submitted run to send.
 * @returns An empty Promise.
 */
export async function sendSubmit(client: Client<true>, guildId: string, submit: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.submit?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, submit.username);
    const name = member?.displayName ?? submit.username.split('#')[0];
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.avatarURL() ?? undefined },
        title: `New Submit by ${name}`,
        url: submit.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(submit.map)}.jpg`},
        description: `*patch:* ${submit.patch}\n*season*: ${submit.season}\n*category*: ${submit.category}\n*map*: ${submit.map}\n*time*: ${submit.time.toFixed(2)}\n*proof*: ${Formatters.hyperlink("link", submit.proof)}\n*date*: ${Formatters.time(submit.date, Formatters.TimestampStyles.ShortDateTime)}`,
        footer: { text: "" + submit.submitId }
    }
    await channel.send({ content: member ? Formatters.userMention(member.id) : "", embeds: [embed] });
    channel.send(submit.proof);
}


/**
 * Sends the pb to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the pb to.
 * @param submit The submitted run (which is a pb) to send.
 * @param pb The previous pb of the user.
 * @returns An empty Promise.
 */
export async function sendPb(client: Client<true>, guildId: string, submit: Run, pb: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.wr?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, submit.username);
    const name = member?.displayName ?? submit.username.split('#')[0];
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.avatarURL() ?? undefined },
        title: `New Personal Best by ${name}`,
        url: submit.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(submit.map)}.jpg`},
        description: `*patch:* ${submit.patch}\n*season*: ${submit.season}\n*category*: ${submit.category}\n*map*: ${submit.map}\n*time*: ${submit.time.toFixed(2)}\n*saved:* ${(pb.time - submit.time).toFixed(2)}\n*proof*: ${Formatters.hyperlink("link", submit.proof)}\n*date*: ${Formatters.time(submit.date, Formatters.TimestampStyles.ShortDateTime)}`,
        footer: { text: "ID: " + submit.submitId }
    }
    await channel.send({ content: member ? Formatters.userMention(member.id) : "", embeds: [embed] });
    channel.send(submit.proof);
}


/**
 * Sends the record to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the wr to.
 * @param submit The submitted run (which is a wr) to send.
 * @param record The previous record.
 * @returns An empty Promise.
 */
export async function sendWr(client: Client<true>, guildId: string, submit: Run, record: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.wr?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, submit.username);
    const name = member?.displayName ?? submit.username.split('#')[0];
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.avatarURL() ?? undefined },
        title: `New World Record by ${name}`,
        url: submit.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(submit.map)}.jpg`},
        description: `*patch:* ${submit.patch}\n*season*: ${submit.season}\n*category*: ${submit.category}\n*map*: ${submit.map}\n*time*: ${submit.time.toFixed(2)}\n*saved:* ${(record.time - submit.time).toFixed(2)}\n*proof*: ${Formatters.hyperlink("link", submit.proof)}\n*date*: ${Formatters.time(submit.date, Formatters.TimestampStyles.ShortDateTime)}`,
        footer: { text: "ID: " + submit.submitId }
    }
    await channel.send({ content: member ? Formatters.userMention(member.id) : "", embeds: [embed] });
    channel.send((submit.username != record.username ? getBm(name) : "") + "\n" + submit.proof);
}


/**
 * Sends the deleted run to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the deleted run to.
 * @param submit The run that got deleted.
 * @returns An empty Promise.
 */
export async function sendDelete(client: Client<true>, guildId: string, submit: Run): Promise<void> {
    return;
}


/**
 * Sends a rank update to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the rank update to.
 * @param member The member whose rank updated.
 * @param newRole The new role of the rank.
 * @param isRankUp If the member has risen or fallen in rank.
 * @returns An empty Promise.
 */
export async function sendRank(client: Client<true>, guildId: string, member: GuildMember, newRole: string, isRankUp: boolean): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.rank?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const role = await guild.roles.fetch(newRole);
    const embed: APIEmbed = {
        author: { name: member.displayName, icon_url: member.avatarURL() ?? undefined },
        title: `${Formatters.userMention(member.id)} ${(isRankUp ? "Ranked up to" : "Ranked down to") + (role ? Formatters.roleMention(role.id) : "no role")}`,
        description: isRankUp ? getRolePa(member.displayName) : getRoleBm(member.displayName)
    }
    await channel.send({ content: Formatters.userMention(member.id), embeds: [embed] });
}


/**
 * Gets some fum bm if someone lost a wr.
 * @param user The username to include in the bm.
 * @returns Some bm sentence, very cringe.
 */
function getBm(user: string): string {
    const bm = [
        'is not gonna like that!',
        'is all washed up!',
        'is still a pretty good surfer, I guess.',
        'you\'re too slow!',
        'it\'s time for a comeback!',
        'get it back, if you can.',
        'had a good run.',
        'stop sandbagging!',
        'got flexed on!',
        'lost good gamer privileges.',
        'they\'re making fun about you!',
        'get good, kid.',
        'just isn\'t good enough.',
        'take back your pride!',
        'my grandma is faster than you!',
        'go back to playing mercy.',
        'even moira is too hard for you.',
        'was stuck in brig jail.',
        'are you a brig main?'
    ];
    const msg = Math.round(Math.random()*(bm.length-1));
    return `${user} ${bm[msg]}`
}


/**
 * Gets a nice message if someone has ranked up.
 * @param user The username to include in the message.
 * @returns Some positive message, very cringe.
 */
function getRolePa(user: string): string {
    const pa = [
        'ever upwards.',
        'really has it in them.',
        'is rising to the stars.',
        'keep it up!',
        'has advanced another level.',
        'can\'t be stopped',
        'is making waves around here.',
        'has got a streak.',
        'is coming for you.',
        'on their road to rank 1.',
        'has robotical precision.'
    ];
    const msg = Math.round(Math.random()*(pa.length-1));
    return `${user} ${pa[msg]}`
}


/**
 * Gets some fum bm if someone has fallen in rank.
 * @param user The username to include in the bm.
 * @returns Some bm sentence, very cringe.
 */
function getRoleBm(user: string): string {
    const bm = [
        'is not gonna like that!',
        'is all washed up!',
        'is still a pretty good surfer, I guess.',
        'it\'s time for a comeback!',
        'get it back, if you can.',
        'stop sandbagging!',
        'lost good gamer privileges.',
        'they\'re making fun about you!',
        'get good, kid.',
        'just isn\'t good enough.',
        'go back to playing mercy.',
        'even moira is too hard for you.',
        'was stuck in brig jail.',
        'are you a brig main?',
        'has dropped the spaghetti.',
        'has been playing floorcio for too long.',
        'got relegated to the lower ranks.'
    ];
    const msg = Math.round(Math.random()*(bm.length-1));
    return `${user} ${bm[msg]}`
}