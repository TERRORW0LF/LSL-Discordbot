const { clearMsg } = require('../../Util/misc');
const serverCfg = require('../../Config/serverCfg.json');
const commands = require('../../commands.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        const reactionMsg = await msg.channel.send('**Reaction Role Menu**');
        msg.delete();
        // TODO: Add to database
    } catch (err) {
        clearMsg(botMsg, undefined);
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        botMsg.delete({timeout: 5000});
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}