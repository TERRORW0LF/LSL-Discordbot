'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const { addTimeout, deleteTimeout } = require(base+'/Util/timeouts');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        var muteRole = serverCfg[msg.guild.id].roles.moderation.mute;
        if (!muteRole) { // Created "mute" role if not already present.
            const guild = msg.guild;
            muteRole = await guild.roles.create({data:{name:"mute", color: 'DEFAULT'}, reason: "need muted role to be able to mute members."});
            for (channel of guild.channels.cache.values()) {
                if (serverCfg[msg.guild.id].channels.mute.has(channel.id)) continue;
                if (channel.type === 'TEXT_CHANNEL') channel.overwritePermissions([{id: muteRole.id, deny: ['SEND_MESSAGES']}], "Allow 'mute' to exclude specified channels.");
                else if (channel.type === 'VOICE_CHANNEL') channel.overwritePermissions([{id: muteRole.id, deny: ['SPEAK']}], "allow 'mute' to exclude specified channels.");
            }
        }
        // Mute member
        const muteMember = msg.mentions.members.first();
        if (!muteMember) return botMsg.edit(createEmbed('No member mentioned.', 'Error', msg.guild.id));
        if (msg.mentions.members.size > 1) return botMsg.edit(createEmbed('Please mention only one member in your message.', 'Error', msg.guild.id));
        if (muteMember.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit(createEmbed('You can only mute members with a lower highest role than yours.', 'Error', msg.guild.id));
            
        const timeout = 604800000*Number(regexGroups[4] | 0)+86400000*Number(regexGroups[7] | 0)+3600000*Number(regexGroups[10] | 0)+60000*Number(regexGroups[13] | 0)+1000*Number(regexGroups[16] | 0);
        if (!muteMember.roles.cache.has(muteRole)) muteMember.roles.add(muteRole);
        let muteEnd,
            x;
        if (timeout >= 604800000) muteEnd = 'until '+new Date(new Date().valueOf() + timeout).toUTCString();
        else muteEnd = `for ${(x = Math.floor(timeout/604800000)) ? x+'w' : ''}${(x = Math.floor(timeout%604800000/86400000)) ? x+'d' : ''}${(x = Math.floor(timeout%86400000/3600000)) ? x+'h' : ''}${(x = Math.floor(timeout%3600000/60000)) ? x+'m' : ''}${(x = Math.floor(timeout%60000/1000)) ? x+'s' : ''}`;
        
        botMsg.edit(createEmbed(`Muted **${muteMember.nickname | muteMember.user.username}** ${muteEnd}${regexGroups[18] ? `\nreason: ${regexGroups[18]}` : ''}`, 'Success', msg.guild.id));
        
        var timeoutFunc = setTimeout(() => {
            muteMember.roles.remove(muteRole);
            msg.channel.send(createEmbed(`**${muteMember.nickname | muteMember.user.username}** can now talk again.`, 'Success', msg.guild.id));
        }, timeout);
        const timeoutid = "mute"+msg.guild.id+muteMember.id;
        deleteTimeout(timeoutid);
        addTimeout(timeoutid, timeoutFunc);
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in mute: '+err.message);
        console.log(err.stack);
    }
}