module.exports = run;

async function run(msg, clinet, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const banUser = msg.mentions.members.first();
        if (!banUser) return botMsg.edit('❌ Please mention a user to ban.');
        if (msg.mentions.members.length > 1) return botMsg.edit('❌ Please only mention one user.');
        if (!banUser.bannable) return botMsg.edit('❌ Unable to ban this user.');    
        if (banUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit('❌ You can only ban members with a lower highest role than yours.');
            
        if (regexGroups[3]) banUser.ban({reason: regexGroups[3]});
        else banUser.ban();

        botMsg.edit(`✅ Successfully banned ${banUser}.`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in ban: ' + err.message);
        console.log(err.stack);
    }
}