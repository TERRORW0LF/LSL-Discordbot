const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, clinet, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const banUser = msg.mentions.members.first();
        if (!banUser) return botMsg.edit(createEmbed('Please mention a user to ban.', 'Error', msg.guild.id));
        if (msg.mentions.members.length > 1) return botMsg.edit(createEmbed('Please only mention one user.', 'Error', msg.guild.id));
        if (!banUser.bannable) return botMsg.edit('❌ Unable to ban this user.');    
        if (banUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit(createEmbed('You can only ban members with a lower highest role than yours.', 'Error', msg.guild.id));
            
        if (regexGroups[3]) banUser.ban({reason: regexGroups[3]});
        else banUser.ban();

        botMsg.edit(createEmbed(`Successfully banned ${banUser}.`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in ban: ' + err.message);
        console.log(err.stack);
    }
}