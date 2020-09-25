const { clearMsg } = require("../../Util/misc");

module.exports = run;

async function run(msg, clinet, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const banUser = msg.mentions.members.first();
        if (!banUser) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please mention a user to ban.');
            return;
        }
        if (msg.mentions.members.length > 1) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please only mention one user.');
            return;
        }
        if (banUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ You can only ban members with a lower highest role than yours.');
            return;
        }
        banUser.ban({reason: regexGroups[3]});
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Successfully banned ${banUser.tag}.`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in ban: ' + err.message);
        console.log(err.stack);
    }
}