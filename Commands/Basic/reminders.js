const base = require('path').resolve('.');
const timeouts = require(base+'/Util/timeouts');

module.exports = run;

// Delete timeout.js, extend GuildMember with .mute(time, reason), .unmute(reason), .mutes, .reminders,
async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Collecting commands, please hold on.');
    try {
        
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}