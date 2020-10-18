module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        msg.channel.send(`✅ ***${msg.author.username}***  Flipped a coin and got **${Math.round(Math.random()) ? 'Heads**' : 'Tails**'}`);
    } catch (err) {
        msg.channel.send('❌ An error occurred while handling your command. Informing staff.');
        console.log('An error occured in dadJoke: '+err.message);
        console.log(err.stack);
    }
}