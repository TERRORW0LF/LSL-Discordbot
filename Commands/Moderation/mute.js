const { clearMsg } = require('../../Util/misc');
const { addTimeout, deleteTimeout } = require('../../Util/Timeouts');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
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
        if (!muteUser) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No member mentioned.');
        }
        if (msg.mentions.members.size > 1) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Please mention only one member in your message.');
        }
        const timeout = 7*24*60*60*1000*Number(regexGroups[4] | 0)+24*60*60*1000*Number(regexGroups[7] | 0)+60*60*1000*Number(regexGroups[10] | 0)+60*1000*Number(regexGroups[13] | 0)+1000*Number(regexGroups[16] | 0);
        if (!muteUser.roles.cache.has(muteRole)) muteUser.roles.add(muteRole);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Muted ${muteUser} for ${timeout}ms${regexGroups[18] ? `\nreason: ${regexGroups[18]}` : ''}`);
        var timeoutFunc = setTimeout(() => {
            muteUser.roles.remove(muteRole);
            msg.channel.send(`✅ ${muteUser} can now talk again.`);
        }, timeout);
        const timeoutid = msg.guild.id+muteUser.id;
        deleteTimeout(timeoutid);
        addTimeout(timeoutid, timeoutFunc);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in mute: '+err.message);
        console.log(err.stack);
    }
}