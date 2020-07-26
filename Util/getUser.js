module.exports = getUser;

async function getUser(guild, user) {
    const mention = await guild.members.fetch({query: user, limit: 1});
    console.log(mention);
    return mention ? mention[0] : user.split('#')[0];
}
