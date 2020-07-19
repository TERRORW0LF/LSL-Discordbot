module.exports = clearMsg

async function clearMsg(botMsg, msg) {
    for (let reaction in msg.reactions.cache) {
        if (reaction.me) reaction.remove();
    }
    for (let reaction in botMsg.reactions.cache) {
        if (reaction.me) reaction.remove();
    }
}