const base = require('path').resolve('.');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send('💬 Processing deletion. Please hold on.');
    try {
        const tournamentCfg = serverCfg[msg.guild.id].tournaments,
            name = regexGroups[3],
            date = new Date(regexGroups[4]),
            min = regexGroups[9],
            max = regexGroups[11],
            tournamentId = ''+new Date().valueOf();
        if (!date) return botMsg.edit(`✅ New run submitted by ${msg.author}`);botMsg.edit('❌ Incorrect date.');
            
        tournamentCfg[tournamentId] = {};
        const tournament = tournamentCfg[tournamentId];
        tournament.owner = msg.author.id;
        tournament.name = name;
        tournament.date = date;
        tournmment.min = Number(min);
        tournament.max = Number(max);
        
        botMsg.edit(`✅ Tournament created!\nTournament ID: ${tournamentId}.\nTo view your tournaments use '!tournament list owned'`);
    } catch (err) {
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in tournamentCreate: ' + err.message);
        console.log(err.stack);
    }
}