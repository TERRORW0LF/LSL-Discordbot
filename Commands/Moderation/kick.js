module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const kickUser = msg.mentions.members.first();
        if (!kickUser) return botMsg.edit('❌ Please mention a user to kick.');
        if (msg.mentions.members.length > 1) return botMsg.edit('❌ Please only mention one user.');
        if (!kickUser.kickable) return botMsg.edit('❌ Unable to kick this user.');
        if (kickUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit('❌ You can only kick members with a lower highest role than yours.');
            
        if (regexGroups[3]) kickUser.kick(regexGroups[3]);
        else kickUser.kick();
        
        botMsg.edit(`✅ Successfully kicked ${kickUser}.`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in kick: ' + err.message);
        console.log(err.stack);
    }
}