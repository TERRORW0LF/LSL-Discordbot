'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const { deleteTimeout } = require(base+'/Util/timeouts');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const answer = await deleteTimeout("mute"+msg.guild.id+regexGroups[2]);
        if (answer) {
            msg.mentions.members.get(regexGroups[2]).roles.remove(serverCfg[msg.guild.id].roles.moderation.mute);
            botMsg.edit(createEmbed(`Successfully unmuted <@${regexGroups[2]}>.`, 'Success', msg.guild.id));
            return;
        }
        botMsg.edit(createEmbed(`<@${regexGroups[2]}> is either not muted or not in the guild anymore.`, 'Error', msg.guild.id));
    } catch(err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in unmute: ' + err.message);
        console.log(err.stack);
    }
}