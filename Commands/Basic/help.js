'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');
const commands = require(base+'/commands.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Collecting commands, please hold on.', 'Working', msg.guild.id));
    try {
        const guildId = msg.guild.id,
              permissionCfg = serverCfg[guildId] ? serverCfg[guildId].permissions : serverCfg.default.permissions,
              commandGroup = regexGroups[1].trim(),
              commandGroups = new Map();
        let answer = '**Command list:**';
        for (let command of commands.commandList) {
            if (commandGroup && commandGroup !== command.group) continue; // if a group is given skip commands from other groups
            if (permissionCfg[command.group]) { // Skip command if user has no permission for it.
                let skipCmd = true;
                for (let role of permissionCfg[command.group]) {
                    if (msg.member.roles.cache.has(role)) skipCmd = false;
                }
                if (skipCmd) continue;
            }
            if (commandGroups.has(command.group))
                commandGroups.get(command.group).push(`${command.name}: ${command.help}`);
            else
                commandGroups.set(command.group, [`${commmand.name}: ${command.help}`]);
        }
        commandGroups.forEach((value, key) => answer += `\n**${key}**\n`+'```\n'+value.join('\n')+'```');
        if (answer === '**Command list:**') {
            botMsg.edit(createEmbed(`No Commands found.`, `Error`, msg.guild.id));
            return;
    }
        botMsg.edit(createEmbed(answer, `Success`, msg.guild.id));
    } catch (err) {
        botMsg.edit(``, createEmbed(`An error occurred while handling your command. Informing staff.`, `Error`, msg.guild.id));
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}
