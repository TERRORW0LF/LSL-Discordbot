const Discord = require('discord.js');

const base = require('path').resolve('.');
console.log(base);
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(reaction, user) {
    const message = reaction.message;
    try {
        if (!message.guild) return;
        const starboardCfg = serverCfg[message.guild.id].features.starboard;
        if (!starboardCfg.enabled) return;
        if (reaction.emoji.name !== starboardCfg.emoji) return;
        if (message.author.id === user.id) {
            message.channel.send(`${user}, you cannot star your own messages.`);
            return;
        }
        const reactionCount = reaction.users.cache.has(message.author.id) ? reaction.count-1 : reaction.count;
        if (reactionCount < starboardCfg.count) return;
        if (!starboardCfg.channel) {
            message.channel.send(`❌ ${user} This server does not have a starboard channel set up.`);
            return;
        }
        const boardChannel = message.guild.channels.cache.get(starboardCfg.channel),
              boardMessage = (await boardChannel.messages.fetch({ limit: 100 })).find(msg => msg.embeds[0].footer.text.startsWith('⭐') && msg.embeds[0].footer.text.endsWith(message.id));
        if (boardMessage) {
            let embed = new Discord.MessageEmbed(boardMessage.embeds[0]);
            embed.setFooter(`⭐ ${reactionCount} | ${message.id}`);
            boardMessage.edit({embed});
        } else {
            let attachment;
            if (message.attachments.size) {
                const attachmentUrl = message.attachments.first().url,
                    splitUrl = attachmentUrl.split('.'),
                    isImage = /(jpg|jpeg|png|gif)/gi.test(splitUrl[splitUrl.length-1]);
                if (isImage) attachment = attachmentUrl
                else attachment = '';
            }
            let embed = new Discord.MessageEmbed()
                .setColor(3010349)
                .setDescription(message.cleanContent)
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
                .addField('Source', `[Jump to](${message.url})`)
                .setTimestamp(new Date())
                .setFooter(`⭐ ${reactionCount} | ${message.id}`)
                .setImage(attachment);
            boardChannel.send({ embed });
        }
    } catch(err) {
        message.channel.send('❌ An error occurred while handling starboard. Informing staff.');
        console.log('An error occured in addedStar: '+err.message);
        console.log(err.stack);
    }
}