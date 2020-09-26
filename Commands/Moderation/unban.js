const strComp = require('string-similarity');
const { clearMsg, getUserReaction } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    console.log(regexGroups);
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const bannedUsers = await msg.guild.fetchBans(),
              bannedUserOpts = [];
        let bannedUser,
            bannedUsersTag = [];
        bannedUsers.each(value => { bannedUsersTag.push(value.user.tag); });
        for (var i = 0; i<5 && i<bannedUsers.size; i++) {
            let d;
            if (regexGroups[2].includes('#')) d = strComp.findBestMatch(regexGroups[2], bannedUsersTag);
            else d = strComp.findBestMatch(regexGroups[2], bannedUsersTag.map(value => value = value.split('#')[0]));
            if (d.bestMatch < 0.7) break;
            bannedUserOpts.push(bannedUsersTag[d.bestMatchIndex]);
            bannedUsersTag.splice(d.bestMatchIndex, 1);
        }
        if (!bannedUserOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No banned user found for '+regexGroups[2]);
            return;
        }
        bannedUser = bannedUsers.find(value => value.user.tag === bannedUserOpts[0]).user;
        if (bannedUserOpts.length > 1) {
            bannedUser = await getUserReaction(msg, botMsg, bannedUserOpts);
            if (!bannedUser) {
                clearMsg(botMsg, msg);
                msg.react('⌛');
                botMsg.edit('⌛ No user selected.');
                return;
            }
            bannedUser = bannedUsers.find(value => value.user.tag === bannedUser).user;
        }
        console.log(bannedUser);
        if (regexGroups[4]) msg.guild.members.unban(bannedUser, regexGroup[4]);
        else msg.guild.members.unban(bannedUser);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Successfully unbanned ${bannedUser}.`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in unban: ' + err.message);
        console.log(err.stack);
    }
}