'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const { deleteTimeout } = require(base+'/Util/timeouts');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const member = msg.mentions.members.first();
        if (!member) return botMsg.edit(createEmbed('No member mentioned.', 'Error', msg.guild.id));
        const answer = await deleteTimeout("mute"+msg.guild.id+member.id);
        if (answer) {
            member.roles.remove(serverCfg[msg.guild.id].roles.moderation.mute);
            botMsg.edit(createEmbed(`Successfully unmuted **${member.nickname || member.user.username}**.`, 'Success', msg.guild.id));
            return;
        }
        botMsg.edit(createEmbed(`**${member.nickname || member.user.username}** is not muted.`, 'Error', msg.guild.id));
    } catch(err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in unmute: ' + err.message);
        console.log(err.stack);
    }
}