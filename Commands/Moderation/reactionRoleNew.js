const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');
const commands = require(base+'/commands.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        const reactionMsg = await msg.channel.send('**Reaction Role Menu**');
        msg.delete();
        // TODO: Add to database
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        botMsg.delete({timeout: 5000});
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}