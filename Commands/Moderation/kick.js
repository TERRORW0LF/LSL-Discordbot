'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const kickUser = msg.mentions.members.first();
        if (!kickUser) return botMsg.edit(createEmbed('Please mention a user to kick.', 'Error', msg.guild.id));
        if (msg.mentions.members.length > 1) return botMsg.edit(createEmbed('Please only mention one user.', 'Error', msg.guild.id));
        if (!kickUser.kickable) return botMsg.edit(createEmbed('Unable to kick this user.', 'Error', msg.guild.id));
        if (kickUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit(createEmbed('You can only kick members with a lower highest role than yours.', 'Error', msg.guild.id));
            
        if (regexGroups[3]) kickUser.kick(regexGroups[3]);
        else kickUser.kick();
        
        botMsg.edit(createEmbed(`Successfully kicked ${kickUser}.`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in kick: ' + err.message);
        console.log(err.stack);
    }
}