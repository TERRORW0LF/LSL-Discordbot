const { clearMsg } = require('../../Util/misc');
const { deleteTimeout } = require('../../Util/Timeouts');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Collecting user data, please hold on.');
    try {
        const answer = await deleteTimeout(msg.guild.id+regexGroups[2]);
        if (answer) {
            clearMsg(botMsg, msg);
            msg.react('✅');
            botMsg.edit(`✅ Successfully unmuted <@${regexGroups[2]}>.`);
        } 
        else {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit(`❌ <@${regexGroups[2]}> is either not muted or not in the guild anymore.`);
        }
    } catch(err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in unmute: ' + err.message);
        console.log(err.stack);
    }
}