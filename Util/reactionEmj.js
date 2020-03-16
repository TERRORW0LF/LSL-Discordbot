module.exports = {getEmojiFromNum, getNumFromEmoji, reactionFilter};

function getEmojiFromNum(num) {
    switch(num) {
        case 1: return '1️⃣';
        case 2: return '2️⃣';
        case 3: return '3️⃣';
        case 4: return '4️⃣';
        case 5: return '5️⃣';
        default: throw new Error('No corresponding emoji!')
    }
}

function getNumFromEmoji(emoji) {
    switch(emoji) {
        case '1️⃣': return '1';
        case '2️⃣': return '2';
        case '3️⃣': return '3';
        case '4️⃣': return '4';
        case '5️⃣': return '5';
        default: throw new Error('No corresponding number');
    }
}

function reactionFilter(opts, id) {
    return (reaction, user) => {
        return user.id === id && opts.includes(reaction.emoji.name);
    }
}