'use strict';

const strComp = require('string-similarity');
const base = require('path').resolve('.');
const { createEmbed, getUserReaction } = require(base+'/Util/misc');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Searching user data, please hold on.', 'Working', msg.guild.id));
    try {
        const bannedUsers = await msg.guild.fetchBans(),
              bannedUserOpts = [];
        let bannedUsersTag = [];
        bannedUsers.each(banInfo => { bannedUsersTag.push(banInfo.user.tag); });
        let d;
        if (regexGroups[2].includes('#')) d = strComp.findBestMatch(regexGroups[2], bannedUsersTag);
        else d = strComp.findBestMatch(regexGroups[2], bannedUsersTag.map(value => value = value.split('#')[0]));
        for (let [index, value] of d.ratings.entries()) {
            if (value.rating < 0.7) continue;
            bannedUserOpts.push(bannedUsersTag[index]);
        }
        if (!bannedUserOpts.length) return botMsg.edit(createEmbed('No banned user found for '+regexGroups[2], 'Error', msg.guild.id));
            
        const { option: bannedUser } = bannedUserOpts.length === 1 ? {option:bannedUserOpts[0]} : await getUserReaction(msg.author, botMsg, bannedUserOpts);
        if (!bannedUser) return botMsg.edit(createEmbed('No user selected.', 'Timeout', msg.guild.id));
            
        bannedUser = bannedUsers.find(value => value.user.tag === bannedUser).user;
        if (regexGroups[4]) msg.guild.members.unban(bannedUser, regexGroup[4]);
        else msg.guild.members.unban(bannedUser);
        
        botMsg.edit(createEmbed(`Successfully unbanned **${bannedUser.username}**.`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in unban: ' + err.message);
        console.log(err.stack);
    }
}