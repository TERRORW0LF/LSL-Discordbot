'use strict';

const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(oldPresence, newPresence) {
    try {
        const streamingCfg = serverCfg?.[newPresence.guild.id]?.features?.streaming;
        if (!streamingCfg?.enabled) return;
        const streamingRole = streamingCfg.role;
        if (!streamingRole) return;
        await newPresence.member.fetch();
        if (!newPresence.member.manageable) return;
        if (streamingCfg.exclude) {
            for (let role of streamingCfg.exclude)
                if (newPresence.member.roles.cache.has(role)) return;
        }
        if (streamingCfg.include) {
            let hasRole = false;
            for (let role of streamingCfg.include) {
                if (newPresence.member.roles.cache.has(role)) {
                    hasRole = true;
                    break;
                }
            }
            if (!hasRole) return;
        }
        if ((!oldPresence || oldPresence.activities.some(activity => activity.type === 'STREAMING')) && !newPresence.activities.some(activity => activity.type === 'STREAMING')) {
            newPresence.member.roles.remove(streamingRole).catch(err => {
                if (serverCfg[newPresence.guild.id].channels.error)
                newPresence.guild.channels.cache.get(serverCfg[newPresence.guild.id].channels.error).send(`Error while removing streaming role: *${err.message}*`);
            });
            return;
        }
        if ((!oldPresence || !oldPresence.activities.some(activity => activity.type === 'STREAMING')) && newPresence.activities.some(activity => activity.type === 'STREAMING'))
            newPresence.member.roles.add(streamingRole).catch(err => {
                if (serverCfg[newPresence.guild.id].channels.error)
                newPresence.guild.channels.cache.get(serverCfg[newPresence.guild.id].channels.error).send(`Error while adding streaming role: *${err.message}*`);
            });
    } catch (err) {
        console.log('An error occured in streamingRole: '+err.message);
        console.log(err.stack);
    }
}