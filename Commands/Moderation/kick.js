const { clearMsg } = require("../../Util/misc");

module.exports = run;

async function run(msg, clinet, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const kickUser = msg.mentions.members.first();
        if (!kickUser) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please mention a user to kick.');
            return;
        }
        if (msg.mentions.members.length > 1) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please only mention one user.');
            return;
        }
        if (kickUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ You can only kick members with a lower highest role than yours.');
            return;
        }
        kickUser.kick(regexGroups[3]);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Successfully kicked ${kickUser.tag}.`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in kick: ' + err.message);
        console.log(err.stack);
    }
}