const serverCfg = require('../../Config/serverCfg.json');
const commands = require('../../commands.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const guildId = msg.guild.id,
          permissionCfg = serverCfg[guildId].permissions,
          commandGroup = regexGroups[1].trim();
    let answer = 'Command list:```';
    for (let command of commands.commandList) {
        if (permissionCfg[command.group]) { // Skip command if user has no permission for it.
            let skipCmd = true;
            for (let role of permissionCfg[command.group]) {
                if (msg.member.roles.cache.has(role)) skipCmd = false;
            }
            if (skipCmd) continue;
        }
        if (commandGroup && commandGroup !== command.group) continue; // if a group is given skip commands from other groups
        const group = `[${command.group}] `,
              name = `${command.name}`,
              help = command.help;
        answer += `\n${group}${name}: ${help}`;
    }
    answer += '```';
    if (answer === 'Command list:``````') answer = 'No commands found.';
    msg.channel.send(answer);
}
