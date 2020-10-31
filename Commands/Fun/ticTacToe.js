'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const { getUserDecision } = require(base+'/Util/misc');


module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Setting up game, please hold on.', 'Working', msg.guild.id)),
          playMsg = await msg.channel.send('.');
    try {
        let player1 = msg.member,
            player2 = null;
        if (msg.mentions.members.size > 1) return botMsg.edit(createEmbed('You can only challenge one member.', 'Error', msg.guild.id));
        if (msg.mentions.members.first()) {
            try {
                if (!await getUserDecision(msg.mentions.users.first(), botMsg, `${msg.author} challanged you to tictactoe, do you accept?`)) {
                    try {
                        if (!await getUserDecision(msg.author, botMsg, 'Opponent declined match, do you want to play against me instead?')) {
                            return botMsg.edit(createEmbed('Challanger declined bot duel. Match aborted.', 'Error', msg.guild.id));
                        }
                    } catch (err) {
                        return botMsg.edit(createEmbed(`Challanger did not answer bot duel request. Match aborted.`, 'Error', msg.guild.id));
                    }
                }
            } catch (err) {
                return botMsg.edit(createEmbed('Opponent did not answer. Match aborted.', 'Error', msg.guild.id));
            }
            player2 = msg.mentions.users.first();
        }

        // Set up bot to act as opponent

        // Set up playfield
        let opts = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'],
            playEmojis = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'],
            playField = [0, 0, 0, 0, 0, 0, 0, 0, 0],
            currPlayer = Math.random() < 0.5 ? player1 : player2;
        botMsg.reactions.removeAll();
        botMsg.edit(createEmbed(`It's ${currPlayer}'s turn.`, '', msg.guild.id));
        playMsg.edit(createPlayfield(playField));
        let promiseArray = []
        for (let opt of opts)
            promiseArray.push(playMsg.react(opt));
        await Promise.all(promiseArray);

        // Play the game
        const collector = playMsg.createReactionCollector((reaction, user) => {return (user.id === currPlayer.id && playEmojis.includes(reaction.emoji.name))}, {max: 9, idle: 30000});
        collector.on('collect', reaction => {
            playField[opts.indexOf(reaction.emoji.name)] = (currPlayer === player1 ? 1 : 2);
            playMsg.reactions.cache.get(reaction.emoji.name).remove();
            let index = playEmojis.indexOf(reaction.emoji.name);
            playEmojis.splice(index, 1);
            playMsg.edit(createPlayfield(playField));
            if (checkWin(playField)) return collector.stop('winner');
            currPlayer = currPlayer === player1 ? player2 : player1;
            botMsg.edit(createEmbed(`It's ${currPlayer}'s turn.`, '', msg.guild.id));
        });
        collector.on('end', (_, reason) => {
            playMsg.reactions.removeAll();
            if (reason === 'winner') return botMsg.edit(createEmbed(`🏆 ${currPlayer} won the game!`, '', msg.guild.id));
            if (reason === 'idle') return botMsg.edit(createEmbed(`🏆 ${currPlayer} didn't make a move in time, ${currPlayer === player1 ? player2 : player1} won the game!`, '', msg.guild.id));
            return botMsg.edit(createEmbed(`The match ended in a draw, no winner can be determined.`, '', msg.guild.id));
        });
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command. Informing staff.', '', msg.guild.id));
        console.log('An error occured in TickTacToe: '+err.message);
        console.log(err.stack);
    }
}

function createPlayfield(playField) {
    let playFieldEmoji = '';
    for (let i = 0; i < 7; i+=3) {
        for (let k = 0; k < 3; k++)
            playFieldEmoji += getFieldEmoji(playField[i+k]);
        playFieldEmoji += '\n';
    }
    return playFieldEmoji;
}

function checkWin(playField) {
    const center = playField[4];
    if (center)
        for (let i = 0; i < 4; i++)
            if (playField[i] === center && playField[8-i] === center) return true;
    const topLeft = playField[0];
    if (topLeft) {
        if (playField[1] === topLeft && playField[2] === topLeft) return true;
        if (playField[3] === topLeft && playField[6] === topLeft) return true;
    }
    const bottomRight = playField[8];
    if (bottomRight) {
        if (playField[7] === bottomRight && playField[6] === bottomRight) return true;
        if (playField[2] === bottomRight && playField[5] === bottomRight) return true;
    }
    return false;
}

function getFieldEmoji(number) {
    switch (number) {
        case 0: return '🟦 ';
        case 1: return '🇽 ';
        case 2: return '🇴 ';
        default: return '🇴 ';
    }
}

function minmax(board) {
    return;
}