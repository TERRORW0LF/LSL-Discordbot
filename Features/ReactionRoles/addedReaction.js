const base = require('path').resolve('.');
const serverCfg = require(base+'Config/serverCfg.json');

module.exports = run;

async function run(reaction, user) {
    try {
        if (!reaction.message.guild) return;
        if (!serverCfg[reaction.message.guild.id]) return;
        if (!serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id]) return;
        if (!serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id][reaction.emoji.name]) return;
        const member = await reaction.message.guild.members.fetch(user.id);
        if (!member) return;
        member.roles.add(serverCfg[reaction.message.guild.id].features.reactionRole[reaction.message.id][reaction.emoji.name], "added role reaction.").catch(err => console.log('unable to add role to member: '+err));
    } catch (err) {
        console.log('An error occured in addedReaction: '+err.message);
        console.log(err.stack);
    }
}