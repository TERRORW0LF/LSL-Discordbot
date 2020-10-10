const Discord = require('discord.js');

const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(reaction, user) {
    const message = reaction.message;
    try {
        const starboardCfg = serverCfg[message.guild.id].starboard;
        if (reaction.emoji.name !== starboardCfg.emoji) return;
        if (message.author.id === user.id) return;
        if (!serverCfg[reaction.message.guild.id].starboard.channel) return;
        const boardChannel = message.guild.channels.cache.get(starboardCfg.channel),
            boardMessage = (await boardChannel.messages.fetch({ limit: 100 })).find(msg => msg.embeds[0].footer.text.startsWith('⭐') && msg.embeds[0].footer.text.endsWith(message.id));
        const reactionCount = reaction.users.cache.has(message.author.id) ? reaction.count-1 : reaction.count;
        if (reactionCount < starboardCfg.count) {
            if (boardMessage) boardMessage.delete({reason: 'Not enough stars anymore.'});
            return;
        }
        if (!boardMessage) {
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
                .addField('Source', `[Jump to](${messsage.url})`)
                .setTimestamp(new Date())
                .setFooter(`⭐ ${reactionCount} | ${message.id}`)
                .setImage(attachment);
            boardChannel.send({ embed });
            return;
        }
        let embed = new Discord.MessageEmbed(boardMessage.embeds[0]);
        embed.setFooter(`⭐ ${reactionCount} | ${message.id}`);
        boardMessage.edit({ embed });
    } catch(err) {
        message.channel.send('❌ An error occurred while handling starboard. Informing staff.');
        console.log('An error occured in addedStar: '+err.message);
        console.log(err.stack);
    }
}