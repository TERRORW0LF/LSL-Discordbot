module.exports = run;

function run(msg, client, regexGroups) {
    const commands = require('../../commands.json'),
          commandGroup = regexGroups[1];
          console.log(commandGroup);
    let answer = 'Command list:```';
    for (let command of commands.commandList) {
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
