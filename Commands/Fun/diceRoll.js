const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        if (regexGroups[2] === '0') return msg.channel.send(createEmbed('Cannot roll 0 dice.', 'Error', msg.guild.id));
        if (!regexGroups[2]) regexGroups[2] = "1";
        let numbers = `${Math.round(Math.random()*parseInt(regexGroups[3]))}`;
        for (let i=1; i<regexGroups[2]; i++)
            numbers += `, ${Math.round(Math.random()*parseInt(regexGroups[3]))}`
        msg.channel.send(createEmbed(`**${msg.member.nickname || msg.author.username}**  Rolled ${regexGroups[2]} ${regexGroups[3]} sided dice and got: **${numbers}**`, 'Success', msg.guild.id));
    } catch (err) {
        msg.channel.send(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in dadJoke: '+err.message);
        console.log(err.stack);
    }
}