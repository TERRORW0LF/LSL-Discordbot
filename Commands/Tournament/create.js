'use strict';

const base = require('path').resolve('.');
const { createEmbed } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const botMsg = await msg.channel.send(createEmbed('Creating tournament, please hold on.', 'Working', msg.guild.id));
    try {
        const tournamentCfg = serverCfg[msg.guild.id].tournaments,
            name = regexGroups[3],
            date = new Date(regexGroups[4]),
            min = regexGroups[9],
            max = regexGroups[11],
            tournamentId = ''+new Date().valueOf();
        if (!date) return botMsg.edit(createEmbed('Incorrect date.', 'Error', msg.guild.id));
            
        tournamentCfg[tournamentId] = {};
        const tournament = tournamentCfg[tournamentId];
        tournament.owner = msg.author.id;
        tournament.name = name;
        tournament.date = date;
        tournmment.min = Number(min);
        tournament.max = Number(max);
        
        botMsg.edit(createEmbed(`**Tournament**\nTournament ID: *${tournamentId}*\n\nTo view your tournaments use '!tournament list owned'`, 'Success', msg.guild.id));
    } catch (err) {
        botMsg.edit(createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in tournamentCreate: ' + err.message);
        console.log(err.stack);
    }
}