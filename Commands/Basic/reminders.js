'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const timeouts = require(base+'/Util/timeouts');

module.exports = run;

// Delete timeout.js, extend GuildMember with .mute(time, reason), .unmute(reason), .mutes, .reminders,
async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching reminders, please hold on.', 'Working', msg.guild.id));
    try {
        
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}