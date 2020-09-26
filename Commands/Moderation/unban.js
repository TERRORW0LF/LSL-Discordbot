const strComp = require('string-similarity');
const { clearMsg, getUserReaction } = require("../../Util/misc");

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Searching user data, please hold on.');
    try {
        const bannedUsers = await msg.guild.fetchBans(),
              bannedUserOpts = [];
        let bannedUser,
            bannedUsersTag = [];
        bannedUsers.each(value => { bannedUsersTag.push(value.user.tag); });
        let d;
        if (regexGroups[2].includes('#')) d = strComp.findBestMatch(regexGroups[2], bannedUsersTag);
        else d = strComp.findBestMatch(regexGroups[2], bannedUsersTag.map(value => value = value.split('#')[0]));
        for ([index, value] of d.ratings.entries()) {
            if (value.rating < 0.7) continue;
            bannedUserOpts.push(bannedUsersTag[index]);
        }
        if (!bannedUserOpts.length) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ No banned user found for '+regexGroups[2]);
            return;
        }
        bannedUser = bannedUserOpts.length === 1 ? bannedUserOpts[0] : await getUserReaction(msg, botMsg, bannedUserOpts);
        if (!bannedUser) {
            clearMsg(botMsg, msg);
            msg.react('⌛');
            botMsg.edit('⌛ No user selected.');
            return;
        }
        bannedUser = bannedUsers.find(value => value.user.tag === bannedUser).user;
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