const { clearMsg } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const bannedPlayer = msg.guild.fetchBans().find(user => regexGroups[2].split('#')[1] ? user.user.tag === regexGroups[2] : user.user.username === regexGroups[2]);
        if (!bannedPlayer) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No banned user found for '+regexGroups[2]);
            return;
        }
        msg.guild.members.unban(bannedPlayer, regexGroups[4]);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Successfully unbanned ${bannedPlayer}.`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in unban: ' + err.message);
        console.log(err.stack);
    }
}