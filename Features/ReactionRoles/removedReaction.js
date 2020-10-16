const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(reaction, user) {
    try {
        if (!reaction.message.guild) return;
        if (!serverCfg[reaction.message.guild.id]) return;
        if (!serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id]) return;
        if (!serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id][reaction.emoji.name]) return;
        const member = await reaction.message.guild.members.fetch(user.id);
        if (!member) return;
        member.roles.remove(serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id][reaction.emoji.name], "removed role reaction.").catch(err => console.log('unable to remove role from member: '+err));
    } catch (err) {
        console.log('An error occured in removedReaction: '+err.message);
        console.log(err.stack);
    }
}