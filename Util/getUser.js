module.exports = getUser;

async function getUser(guild, user) {
    const similarUsers = await guild.members.fetch({query: user.split('#')[0], limit: 5});
    console.log(similarUsers);
    if (!similarUsers) return user.split('#')[0];
    const mention = similarUsers.find(member => member.user.tag === user);
    return mention ? mention : user.split('#')[0];
}
