const handleHelp = require('./handleHelp');
const handleSubmit = require('./handleSubmit');
const handleDelete = require('./handleDelete');
const handleWr = require('./handleWr');
const handlePb = require('./handlePb');
const handleIncomplete = require('./handleIncomplete');
const handleRank = require('./handleRank');

module.exports = handleMessage;

async function handleMessage(message) {
    try {
        if(!message.content.startsWith('!') || message.author.bot) return;
        if (message.content.split(' ')[0] === `!pl` && message.channel.id === '709692915710033930') {
            if (message.content.split(' ')[1].trim() == /[0-9]*/) {
                for (let i; i=1; i<parseInt(message.content.split(' ')[1])) {
                     message.channel.send(`${message.guild.members.get('136146736077996032')}`);
                }
            }
            message.channel.send(`${message.guild.members.get('136146736077996032')}`);
            return;
        }
        if(message.channel.id !== process.env.botCHANNEL) {
            message.channel.send(`Please post commands in <#${process.env.botCHANNEL}>.`);
            return;
        }
        const command = message.content.split(' ')[0].toLowerCase();
        switch(command) {
            case '!submit':
                handleSubmit(message);
                break;
            case '!delete':
                handleDelete(message);
                break;
            case '!wr':
                handleWr(message);
                break;
            case '!pb':
                handlePb(message);
                break;
            case '!incomplete':
                handleIncomplete(message);
                break;
            case '!rank':
                handleRank(message);
                break;
            case '!help':
                handleHelp(message);
                break;
            case '!version':
                message.channel.send('1.1');
                break;
            default:
                message.react('❌');
                message.channel.send('❌ Unknown command. use \'!help\' for an overview of this bots available commands.')
                return;
        }
    } catch(e) {
        console.error('Error at handleMessage: ' + e.message);
        console.log(e.stack);
        message.react('❌');
        message.channel.send('❌ An error occurred while handling your command. Informing staff.');
    }
}
