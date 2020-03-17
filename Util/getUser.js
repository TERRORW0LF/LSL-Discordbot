module.exports = getUser;

async function getUser(guild, user) {
    const guildMembers = await guild.fetchMembers(user, 10);
    console.log('hey');
    const members = await guildMembers.members;
    console.log('hey');
    const mention = await members.find(u => u.user.tag === user);
    if (!mention) return user.split('#')[0]; 
    else return mention;
}
