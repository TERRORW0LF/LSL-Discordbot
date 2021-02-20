'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const kickMember = msg.mentions.members.first();
        if (!kickMember) return botMsg.edit(createEmbed('No member mentioned.', 'Error', msg.guild.id));
        if (msg.mentions.members.length > 1) return botMsg.edit(createEmbed('More than one member mentioned.', 'Error', msg.guild.id));
        if (!kickMember.kickable) return botMsg.edit(createEmbed('Unable to kick this user.', 'Error', msg.guild.id));
        if (kickMember.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit(createEmbed('You can only kick members with a lower highest role than yours.', 'Error', msg.guild.id));
            
        if (regexGroups[3]) kickMember.kick(regexGroups[3]);
        else kickMember.kick();
        
        botMsg.edit(createEmbed(`Successfully kicked **${kickMember.nickname || kickMember.user.username}**.`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in kick: ' + err.message);
        console.log(err.stack);
    }
}