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
            player2 = null,
            botPlayer = false;
        if (msg.mentions.members.size > 1) return botMsg.edit(createEmbed('You can only challenge one member.', 'Error', msg.guild.id)), playMsg.delete();
        if (msg.mentions.members.first()) {
            try {
                if (!await getUserDecision(msg.mentions.users.first(), botMsg, `${msg.author} challanged you to tictactoe, do you accept?`)) {
                    try {
                        if (!await getUserDecision(msg.author, botMsg, 'Opponent declined match, do you want to play against me instead?')) {
                            return botMsg.edit(createEmbed('Challanger declined bot duel. Match aborted.', 'Error', msg.guild.id)), playMsg.delete();
                        }
                    } catch (err) {
                        return botMsg.edit(createEmbed(`Challanger did not answer bot duel request. Match aborted.`, 'Error', msg.guild.id)), playMsg.delete();
                    }
                }
            } catch (err) {
                console.log(err);
                return botMsg.edit(createEmbed('Opponent did not answer. Match aborted.', 'Error', msg.guild.id)), playMsg.delete();
            }
            player2 = msg.mentions.users.first();
        } else {
            player2 = msg.guild.me;
            botPlayer = true;
        }

        // Set up playfield
        let opts = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'],
            playEmojis = ['↖️', '⬆️', '↗️', '⬅️', '⏺️', '➡️', '↙️', '⬇️', '↘️'],
            playField = [0, 0, 0, 0, 0, 0, 0, 0, 0],
            currPlayer = Math.random() < 0.5 ? player1 : player2;
        botMsg.reactions.removeAll();
        botMsg.edit(createEmbed(`It's ${currPlayer}'s turn.`, 'Standard', msg.guild.id));
        playMsg.edit(createPlayfield(playField));
        let promiseArray = []
        for (let opt of opts)
            promiseArray.push(playMsg.react(opt));
        await Promise.all(promiseArray);

        // Play the game
        const collector = playMsg.createReactionCollector((reaction, user) => {return (user.id === currPlayer.id && playEmojis.includes(reaction.emoji.name))}, {max: 9, idle: 30000});
        
        // Make move if bot is going first
        if (currPlayer.id === msg.guild.me.id) {
            const { index } = minimax(playField, false);
            const move = index[Math.floor(Math.random()*index.length)];
            playMsg.reactions.cache.get(opts[move]).remove();
            playMsg.react(opts[move]);
        }

        collector.on('collect', reaction => {
            playField[opts.indexOf(reaction.emoji.name)] = (currPlayer === player1 ? 1 : 2);
            playMsg.reactions.cache.get(reaction.emoji.name).remove();
            let index = playEmojis.indexOf(reaction.emoji.name);
            playEmojis.splice(index, 1);
            playMsg.edit(createPlayfield(playField));
            if (checkWin(playField)) return collector.stop('winner');
            if (!playEmojis.length) return;
            currPlayer = currPlayer === player1 ? player2 : player1;
            botMsg.edit(createEmbed(`It's ${currPlayer}'s turn.`, 'Standard', msg.guild.id));
            if (currPlayer.id === msg.guild.me.id) {
                const { index } = minimax(playField, false);
                const move = index[Math.floor(Math.random()*index.length)];
                playMsg.reactions.cache.get(opts[move]).remove();
                playMsg.react(opts[move]);
            }
        });
        
        collector.on('end', (_, reason) => {
            playMsg.reactions.removeAll();
            if (reason === 'winner') return botMsg.edit(createEmbed(`🏆 ${currPlayer} won the game!`, 'Standard', msg.guild.id));
            if (reason === 'idle') return botMsg.edit(createEmbed(`🏆 ${currPlayer} didn't make a move in time, ${currPlayer === player1 ? player2 : player1} won the game!`, 'Standard', msg.guild.id));
            return botMsg.edit(createEmbed(`The match ended in a draw, no winner can be determined.`, 'Standard', msg.guild.id));
        });
    } catch (err) {
        playMsg.delete();
        botMsg.edit('', createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
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

function minimax(playField, isMaximizing) {
    let bestScore = isMaximizing ? -Infinity : Infinity,
        index = [];
    // Loop through playfield
    for (let i=0; i<playField.length; i++) {
        if (!!playField[i]) continue;
        // Set next playfield value
        playField[i] = isMaximizing ? 1 : 2;
        // Check if player won and return score and index
        if (checkWin(playField)) {
            playField[i] = 0;
            index.push(i);
            return { score: isMaximizing ? 1 : -1, index };
        }
        // Check if game is drawn and return score and index
        if (!playField.includes(0)) {
            playField[i] = 0;
            index.push(i);
            return { score: 0, index };
        }
        // Run minimax for the next possible set of moves
        const { score } = minimax(playField, !isMaximizing);
        if (isMaximizing) {
            if (score > bestScore) {
                bestScore = score;
                index = [];
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                index = [];
            }
        }
        if (score === bestScore) index.push(i);
        playField[i] = 0;
    }
    return {score: bestScore, index };
}