const serverCfg = require('../../Config/serverCfg.json');
const { clearMsg } = require('../../Util/misc');

module.exports = run;

async function run(msg, clinet, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 searching user data, please hold on.');
    try {
        var mutedRole = serverCfg[msg.guild.id].roles.moderation.mute;
        if (!mutedRole) { // Created "mute" role if not already present.
            const guild = msg.guild;
            mutedRole = await guild.roles.create({data:{name:"mute", color: 'DEFAULT'}, reason: "need muted role to be able to mute members."});
            for (channel of guild.channels.cache.values()) {
                if (serverCfg[msg.guild.id].channels.mute.has(channel.id)) continue;
                if (channel.type === 'TEXT_CHANNEL') channel.overwritePermissions([{id: mutedRole.id, deny: ['SEND_MESSAGES']}], "Allow 'mute' to exclude specified channels.");
                else if (channel.type === 'VOICE_CHANNEL') channel.overwritePermissions([{id: mutedRole.id, deny: ['SPEAK']}], "allow 'mute' to exclude specified channels.");
            }
        }
        // Mute member
        if (!msg.mentions.members.first()) {
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
        msg.mentions.members.first().roles.add(mutedRole);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Muted ${msg.mentions.members.first()} for ${timeout}ms${regexGroups[19] ? `\nreason: ${regexGroups[19]}` : ''}`);
        setTimeout(() => {
            msg.member.roles.remove(mutedRole);
            msg.channel.send(`✅ ${msg.mentions.members.first()} can now talk again.`);
        }, timeout);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in mute: '+err.message);
        console.log(err.stack);
    }
}