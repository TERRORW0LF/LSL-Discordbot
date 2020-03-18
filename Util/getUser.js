module.exports = getUser;

async function getUser(guild, user) {
    const guildMembers = await guild.fetchMembers();
    const members = await guildMembers.members;
    const mention = await members.find(u => u.user.tag === user);
    if (!mention) return user.split('#')[0]; 
    else return mention;
}
