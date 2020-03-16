const { getEmojiFromNum, getNumFromEmoji, reactionFilter } = require('./reactionEmj');

module.exports = getUserReaction;

async function getUserReaction(message, botMsg, opts) {
    const reactOpts = [];
    for (i = 1; i <= opts.length; i++) {
        const emoji = getEmojiFromNum(i);
        reactOpts.push(emoji);
        await botMsg.react(emoji);
    }
    await message.clearReactions();
    await message.react('❔');
    botMsg.edit('❔ React to select the corresponding map!' + opts.map((o, i) => '```'+reactOpts[i]+' '+o+'```').join(''));
    const userChoice = await botMsg.awaitReactions(reactionFilter(reactOpts, message.author.id), {max: 1, time: 15000});
    if (!userChoice || !userChoice.first()) return;
    const opt = await getNumFromEmoji(userChoice.first().emoji.name);
    const map = opts[opt - 1];
    message.clearReactions();
    botMsg.clearReactions();

    return map;
}
