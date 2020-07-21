const { run } = require("googleapis/build/src/apis/run");

module.exports = run;

async function run(msg, client, regexGroups) {
    botMsg = await msg.channel.send('💬 Collecting data, please hold on.');
    msg.react('💬');
    
}