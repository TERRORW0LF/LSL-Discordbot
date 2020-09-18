const { clearMsg } = require("../../Util/misc");

module.exports = run;

async function run(msg, clinet, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        if (msg.mentions.members.length > 1) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please only mention one user.');
            return;
        }
        msg.mentions.members.first().ban({reason: regexGroups[3]});
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Successfully banned ${msg.mentions.members.first().tag}.`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in ban: ' + err.message);
        console.log(err.stack);
    }
}