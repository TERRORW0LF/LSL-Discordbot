'use strict';

module.exports = {getNumFromEmoji, reactionFilter};

function getNumFromEmoji(emoji) {
    switch(emoji) {
        case '1️⃣': return 1;
        case '2️⃣': return 2;
        case '3️⃣': return 3;
        case '4️⃣': return 4;
        case '5️⃣': return 5;
        default: throw new Error('No corresponding number');
    }
}

async function reactionFilter(emojis, allowed={users, roles}) {
    return (reaction, user) => {
        if (!emojis.includes(reaction.emoji.name)) return false;
        if (!allowed.users && allowed.roles) return true;
        if (!allowed.users) return false;
        if (allowed.users.includes(user.id)) return true;
        if (!allowed.roles) return false;
        if (!reaction.message.guild) return false;
        const member = await reaction.message.guild.members.fetch(user.id);
        if (!member) return false;
        let hasRole = false;
        for (role of roles) {
            if (member.roles.cache.has(role)) {
                hasRole = true;
                break;
            }
        }
        return hasRole;
    }
}