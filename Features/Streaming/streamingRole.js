'use strict';

const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(oldPresence, newPresence) {
    try {
        if (!serverCfg[newPresence.guild.id]) return;
        const streamingCfg = serverCfg[newPresence.guild.id].features.streaming;
        if (!newPresence.member.manageable) return;
        if (streamingCfg.excludedRoles.length) {
            for (role of streamingCfg.excludedRoles)
                if (newPresence.member.roles.cache.has(role)) return;
        }
        if (streamingCfg.requiredRoles.length) {
            let hasRole = false;
            for (let role of streamingCfg.requiredRoles) {
                if (newPresence.member.roles.cache.has(role)) {
                    hasRole = true;
                    break;
                }
            }
            if (!hasRole) return;
        }
        const streamingRole = serverCfg[newPresence.guild.id].features.streaming.role;
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