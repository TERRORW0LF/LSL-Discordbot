import { Run } from "./sheets.js";
import { Client, Formatters, GuildMember } from 'discord.js';
import { APIEmbed } from 'discord-api-types';
import { getMemberByName } from './roleUpdate.js';
import guildsCfg from '../config/guildConfig.json' assert { type: 'json' };


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
        author: { name: name, icon_url: member?.displayAvatarURL() ?? undefined },
        color: guildCfg.embeds.info,
        title: `New Submit by ${name}`,
        url: submit.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(submit.map)}.jpg`},
        description: `Patch: *${submit.patch}*\nSeason: *${submit.season}*\nCategory: *${submit.category}*\nMap: *${submit.map}*`,
        fields: [{
            name: "Submit",
            value: `User: *${name}*\nTime: *${submit.time.toFixed(2)}*\nProof: *${Formatters.hyperlink("link", submit.proof)}*\nDate: *${Formatters.time(submit.date)}*`
        }],
        footer: { text: `${submit.submitId}` }
    };
    await channel.send({ content: member ? Formatters.userMention(member.id) : null, embeds: [embed] });
    channel.send(submit.proof);
}


/**
 * Sends the pb to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the pb to.
 * @param oldPb The previous pb of the user.
 * @param newPb The new pb of the user.
 * @returns An empty Promise.
 */
export async function sendPb(client: Client<true>, guildId: string, oldPb: Run | null, newPb: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.pb?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, newPb.username);
    const name = member?.displayName ?? newPb.username.split('#')[0];
    const diff = oldPb ? getDateDiff(oldPb.date, newPb.date) : null;
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.displayAvatarURL() ?? undefined },
        color: guildCfg.embeds.warning,
        title: `New Personal Best by ${name}`,
        url: newPb.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(newPb.map)}.jpg`},
        description: `Patch: *${newPb.patch}*\nSeason: *${newPb.season}*\nCategory: *${newPb.category}*\nMap: *${newPb.map}*`,
        fields: [{
            name: "New PB",
            value: `User: *${name}*\nTime: *${newPb.time.toFixed(2)}*\nProof: *${Formatters.hyperlink('link', newPb.proof)}*\nDate: *${Formatters.time(newPb.date)}*`,
            inline: true
        },
        {
            name: "Old PB",
            value: `User: *${oldPb ? name : 'none'}*\nTime: *${oldPb?.time.toFixed(2) ?? 'none'}*\nProof: *${oldPb ? Formatters.hyperlink('link', oldPb.proof) : 'none'}*\nDate: *${oldPb ? Formatters.time(oldPb.date) : 'none'}*`,
            inline: true
        },
        {
            name: "Comparison",
            value: `Time save: *${oldPb ? (oldPb.time - newPb.time).toFixed(2) : 'undefined'}*\nAchieved after: *${diff ? `${diff.years} years, ${diff.weeks} weeks, ${diff.days} days, ${diff.hours} hours, ${diff.minutes} mins, ${diff.seconds} secs`: 'undefined'}*`
        }],
        footer: { text: "ID: " + newPb.submitId }
    };
    await channel.send({ content: member ? Formatters.userMention(member.id) : null, embeds: [embed] });
    channel.send(newPb.proof);
}


/**
 * Sends the record to the given guild.
 * @param client The client to send the message from.
 * @param guildId The guild id of the guild to send the wr to.
 * @param submit The submitted run (which is a wr) to send.
 * @param newRecord The previous record.
 * @returns An empty Promise.
 */
export async function sendWr(client: Client<true>, guildId: string, oldRecord: Run | null, newRecord: Run): Promise<void> {
    const guildCfg = (guildsCfg as any)[guildId];
    if (!guildCfg) return;

    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(guildCfg?.features?.announce?.wr?.channel);
    if (!channel) return;
    if (!channel.isText()) return;
    const member = await getMemberByName(guild, newRecord.username);
    const name = member?.displayName ?? newRecord.username.split('#')[0];
    const diff = oldRecord ? getDateDiff(oldRecord.date, newRecord.date) : null;
    const embed: APIEmbed = {
        author: { name: name, icon_url: member?.avatarURL() ?? undefined },
        color: guildCfg.embeds.success,
        title: `New World Record by ${name}`,
        url: newRecord.proof,
        thumbnail: { url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/main/assets/pictures/${encodeURIComponent(newRecord.map)}.jpg`},
        description: `Patch: *${newRecord.patch}*\nSeason: *${newRecord.season}*\nCategory: *${newRecord.category}*\nMap: *${newRecord.map}*`,
        fields: [{
            name: "New Record",
            value: `User: *${name}*\nTime: *${newRecord.time.toFixed(2)}*\nProof: *${Formatters.hyperlink('link', newRecord.proof)}*\nDate: *${Formatters.time(newRecord.date)}*`,
            inline: true
        },
        {
            name: "Old Record",
            value: `User: *${oldRecord ? name : 'none'}*\nTime: *${oldRecord?.time.toFixed(2) ?? 'none'}*\nProof: *${oldRecord ? Formatters.hyperlink('link', oldRecord.proof) : 'none'}*\nDate: *${oldRecord ? Formatters.time(oldRecord.date) : 'none'}*`,
            inline: true
        },
        {
            name: "Comparison",
            value: `Time save: *${oldRecord ? (oldRecord.time - newRecord.time).toFixed(2) : 'undefined'}*\nAchieved after: *${diff ? `${diff.years} years, ${diff.weeks} weeks, ${diff.days} days, ${diff.hours} hours, ${diff.minutes} mins, ${diff.seconds} secs`: 'undefined'}*`
        }],
        footer: { text: "ID: " + newRecord.submitId }
    };
    await channel.send({ content: member ? Formatters.userMention(member.id) : null, embeds: [embed] });
    channel.send(((oldRecord && newRecord.username !== oldRecord.username) ? getBm(name) + "\n" : "") + newRecord.proof);
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
        author: { name: member.displayName, icon_url: member.displayAvatarURL() ?? undefined },
        color: isRankUp ? guildCfg.embeds.success : guildCfg.embeds.error,
        title: `Rank update`,
        description: `${Formatters.userMention(member.id)} ${(isRankUp ? "Ranked up to" : "Ranked down to") + (role ? Formatters.roleMention(role.id) : "no role")}`,
        footer: { text: isRankUp ? getRolePa(member.displayName) : getRoleBm(member.displayName) }
    };
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


interface DateDifference {
    years: number,
    weeks: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number
}

/**
 * Gets the difference between 2 dates.
 * @param date1 The first date, has to be the older one.
 * @param date2 The second date, has to be the newer one.
 * @returns A DateDifference object with the difference.
 */
function getDateDiff(date1: Date, date2: Date): DateDifference {
    let sDiff = Math.round((date2.getTime() - date1.getTime()) / 1000);
    const years = Math.floor(sDiff/(365*24*60*60));
    sDiff %= 365*24*60*60;
    const weeks = Math.floor(sDiff/(7*24*60*60));
    sDiff %= 7*24*60*60;
    const days = Math.floor(sDiff/(24*60*60));
    sDiff %= 24*60*60;
    const hours = Math.floor(sDiff/(60*60));
    sDiff %= 60*60;
    const minutes = Math.floor(sDiff/60);
    sDiff %= 60;
    const seconds = sDiff;
    
    return { years, weeks, days, hours, minutes, seconds };
}