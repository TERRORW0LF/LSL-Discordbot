'use strict';

const Discord = require('discord.js');

const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');
const { createEmbed } = require(base+'Util/misc');

module.exports = run;

async function run(reaction, user) {
    const message = reaction.message;
    try {
        if (!message.guild) return;
        if (!serverCfg[message.guild.id]) return;
        const starboardCfg = serverCfg[message.guild.id].features.starboard;
        if (!starboardCfg.enabled) return;
        if (!starboardCfg.channel) return;
        if (reaction.emoji.name !== starboardCfg.emoji) return;
        if (message.author.id === user.id) return;

        const boardChannel = message.guild.channels.cache.get(starboardCfg.channel),
              boardMessage = (await boardChannel.messages.fetch({ limit: 100 })).find(msg => msg.embeds[0].footer.text.startsWith('⭐') && msg.embeds[0].footer.text.endsWith(message.id));
        if (!boardMessage) return;

        const reactionCount = reaction.users.cache.has(message.author.id) ? reaction.count-1 : reaction.count;
        if (reactionCount < starboardCfg.count) {
            boardMessage.delete({reason: 'Message fell below star requirement.'});
            return;
        }
        let embed = new Discord.MessageEmbed(boardMessage.embeds[0]);
        embed.setFooter(`⭐ ${reactionCount} | ${message.id}`);
        boardMessage.edit({ embed });
    } catch(err) {
        message.channel.send(createEmbed(`An error occurred while handling starboard. Informing staff.`, 'Error', message.guild.id));
        console.log('An error occured in removedStar: '+err.message);
        console.log(err.stack);
    }
}