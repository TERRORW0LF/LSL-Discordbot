'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        msg.channel.send(createEmbed(`**${msg.member.nickname || msg.author.username}** Flipped a coin and got **${Math.round(Math.random()) ? 'Heads**' : 'Tails**'}`, 'Success', msg.guild.id));
    } catch (err) {
        msg.channel.send(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in dadJoke: '+err.message);
        console.log(err.stack);
    }
}