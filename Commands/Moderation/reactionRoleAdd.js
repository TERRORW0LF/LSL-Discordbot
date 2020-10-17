module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Adding reaction roles, please hold on.');
    try {
        let message = regexGroups[2],
            emoji = regexGroups[3],
            role = regexGroups[4],
            explanation = regexGroups[5];
        // Get actual message | emoji | role
        if (!message) {
            message = (await msg.channel.messages.fetch({limit: 50})).find(message => message.content.startsWith("**Reaction Role Menu**"));
            if (!message) return botMsg.edit('❌ No reaction role message found.'), botMsg.delete({timeout: 5000});
        }
        else {
            let idArray = message.split('/'),
                channel = idArray[5];
            message = idArray[6];
            channel = msg.guild.channels.cache.get(channel);
            if (!channel) return botMsg.edit('❌ No message found in this server'), botMsg.delete({timeout: 5000});

            message = await channel.messages.fetch(message);
            if (!message) return botMsg.edit('❌ No message found in this server.'), botMsg.delete({timeout: 5000});

            if (!message.author.id === msg.guild.me.id) return botMsg.edit('❌ Please mention a message by me.'), botMsg.delete({timeout: 5000});
            if (!message.content.startsWith('**Reaction Role Menu**')) return botMsg.edit('❌ Message is not a reaction role message.'), botMsg.delete({timeout: 5000});
        }
        if (/<:\S+:\d+>/.test(emoji)) {
            emoji = msg.guild.emojis.cache.get(emoji.split(':')[2].slice(0, -1));
            if (!emoji) return botMsg.edit('❌ No guild emoji found.'), botMsg.delete({timeout: 5000});
        }
        role = msg.guild.roles.cache.get(role);
        if (!role) return botMsg.edit('❌ No role found.'), botMsg.delete({timeout: 5000});
        // Add to message
        message.edit(message.content+`\n\n${emoji}: ${'`'+role.name+'`'} ${explanation}`);
        message.react(emoji);
        // TODO: Add to database

        msg.delete();
        botMsg.delete();
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        botMsg.delete({timeout: 5000});
        console.log('Error in reactionRole: ' + err.message);
        console.log(err.stack);
    }
}