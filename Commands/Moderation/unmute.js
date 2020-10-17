const base = require('path').resolve('.');
const { deleteTimeout } = require(base+'/Util/timeouts');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Collecting user data, please hold on.');
    try {
        const answer = await deleteTimeout("mute"+msg.guild.id+regexGroups[2]);
        if (answer) {
            msg.mentions.members.get(regexGroups[2]).roles.remove(serverCfg[msg.guild.id].roles.moderation.mute);
            botMsg.edit(`✅ Successfully unmuted <@${regexGroups[2]}>.`);
            return;
        }
        botMsg.edit(`❌ <@${regexGroups[2]}> is either not muted or not in the guild anymore.`);
    } catch(err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in unmute: ' + err.message);
        console.log(err.stack);
    }
}