const base = require('path').resolve('.');
const { addTimeout, deleteTimeout } = require(base+'/Util/timeouts');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 searching user data, please hold on.');
    try {
        var muteRole = serverCfg[msg.guild.id].roles.moderation.mute;
        if (!muteRole) { // Created "mute" role if not already present.
            const guild = msg.guild;
            muteRole = await guild.roles.create({data:{name:"mute", color: 'DEFAULT'}, reason: "need muted role to be able to mute members."});
            for (channel of guild.channels.cache.values()) {
                if (serverCfg[msg.guild.id].channels.mute.has(channel.id)) continue;
                if (channel.type === 'TEXT_CHANNEL') channel.overwritePermissions([{id: muteRole.id, deny: ['SEND_MESSAGES']}], "Allow 'mute' to exclude specified channels.");
                else if (channel.type === 'VOICE_CHANNEL') channel.overwritePermissions([{id: muteRole.id, deny: ['SPEAK']}], "allow 'mute' to exclude specified channels.");
            }
        }
        // Mute member
        const muteUser = msg.mentions.members.first();
        if (!muteUser) return botMsg.edit('❌ No member mentioned.');
        if (msg.mentions.members.size > 1) return botMsg.edit('❌ Please mention only one member in your message.');
        if (muteUser.roles.highest.comparePositionTo(msg.member.roles.highest) >= 0) return botMsg.edit('❌ You can only mute members with a lower highest role than yours.');
            
        const timeout = 604800000*Number(regexGroups[4] | 0)+86400000*Number(regexGroups[7] | 0)+3600000*Number(regexGroups[10] | 0)+60000*Number(regexGroups[13] | 0)+1000*Number(regexGroups[16] | 0);
        if (!muteUser.roles.cache.has(muteRole)) muteUser.roles.add(muteRole);
        let muteEnd,
            x;
        if (timeout >= 604800000) muteEnd = 'until '+new Date(new Date().valueOf() + timeout).toUTCString();
        else muteEnd = `for ${(x = Math.floor(timeout/604800000)) ? x+'w' : ''}${(x = Math.floor(timeout%604800000/86400000)) ? x+'d' : ''}${(x = Math.floor(timeout%86400000/3600000)) ? x+'h' : ''}${(x = Math.floor(timeout%3600000/60000)) ? x+'m' : ''}${(x = Math.floor(timeout%60000/1000)) ? x+'s' : ''}`;
        
        botMsg.edit(`✅ Muted ${muteUser} ${muteEnd}${regexGroups[18] ? `\nreason: ${regexGroups[18]}` : ''}`);
        
        var timeoutFunc = setTimeout(() => {
            muteUser.roles.remove(muteRole);
            msg.channel.send(`✅ ${muteUser} can now talk again.`);
        }, timeout);
        const timeoutid = "mute"+msg.guild.id+muteUser.id;
        deleteTimeout(timeoutid);
        addTimeout(timeoutid, timeoutFunc);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in mute: '+err.message);
        console.log(err.stack);
    }
}