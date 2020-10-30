const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');
const commands = require(base+'/commands.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        const reactionMsg = await msg.channel.send('**Reaction Role Menu**');
        msg.delete();
        // TODO: Add to database
    } catch (err) {
        msg.channel.send(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        botMsg.delete({timeout: 5000});
        console.log('An error occured in help: '+err.message);
        console.log(err.stack);
    }
}