const { clearMsg } = require("../../Util/misc");
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const tournamentCfg = serverCfg[msg.guild.id].tournaments,
            name = regexGroups[3],
            date = new Date(regexGroups[4]),
            min = regexGroups[9],
            max = regexGroups[11],
            tournamentId = ''+new Date().valueOf();
        if (!date) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect date.');
            return;
        }
        tournamentCfg[tournamentId] = {};
        const tournament = tournamentCfg[tournamentId];
        tournament.owner = msg.author.id;
        tournament.name = name;
        tournament.date = date;
        tournmment.min = Number(min);
        tournament.max = Number(max);
        clearMsg(botMsg, msg);
        msg.react('✅');
        botMsg.edit(`✅ Tournament created!\nTournament ID: ${tournamentId}.\nTo view your tournaments use '!tournament list owned'`);
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in tournamentCreate: ' + err.message);
        console.log(err.stack);
    }
}