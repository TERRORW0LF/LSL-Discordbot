const strComp = require('string-similarity');
const base = require('path').resolve('.');
const { getUserReaction } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
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
        if (!bannedUserOpts.length) return botMsg.edit('❌ No banned user found for '+regexGroups[2]);
            
        bannedUser = bannedUserOpts.length === 1 ? bannedUserOpts[0] : await getUserReaction(msg, botMsg, bannedUserOpts);
        if (!bannedUser) return botMsg.edit('⌛ No user selected.');
            
        bannedUser = bannedUsers.find(value => value.user.tag === bannedUser).user;
        if (regexGroups[4]) msg.guild.members.unban(bannedUser, regexGroup[4]);
        else msg.guild.members.unban(bannedUser);
        
        botMsg.edit(`✅ Successfully unbanned ${bannedUser}.`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in unban: ' + err.message);
        console.log(err.stack);
    }
}