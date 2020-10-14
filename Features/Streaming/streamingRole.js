const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(oldPresence, newPresence) {
    try {
        const streamingRole = serverCfg[newPresence.guild.id].features.streaming.role;
        if ((!oldPresence || oldPresence.activities.some(activity => activity.type === 'STREAMING')) && !newPresence.activties.some(activity => activity.type === 'STREAMING')) {
            newPresence.member.roles.remove(streamingRole);
            return;
        }
        if ((!oldPresence || !oldPresence.activities.some(activity => activity.type === 'STREAMING')) && newPresence.activities.some(activity => activity.type === 'STREAMING'))
            newPresence.member.roles.add(streamingRole);
    } catch (err) {
        if (serverCfg[newPresence.guild.id].channels.error)
            newPresence.guild.channels.cache.get(serverCfg[newPresence.guild.id].channels.error).send('Erro while adding/removing streaming role. No role defined.');
        console.log('An error occured in streamingRole: '+err.message);
        console.log(err.stack);
    }
}