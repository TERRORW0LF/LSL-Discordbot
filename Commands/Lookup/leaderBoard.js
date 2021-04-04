'use strict';

const Discord = require('discord.js');
const base = require('path').resolve('.');
const { createEmbed, getAllSubmits, getUserReaction, getOptions, getMapPoints, getPlacePoints } = require(base+'/Util/misc');
const serverCfg = require(base+'/Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    const [ botMsg, videoMsg ] = await Promise.all([
        msg.channel.send(createEmbed('Searching leaderboard data.', 'Working', msg.guild.id)),
        msg.channel.send('.')
    ]);
    try {
        const guildId = msg.guild.id,
              guildCfg = serverCfg[guildId] || serverCfg.default,
              seasonOpts = getOptions(regexGroups[2], serverCfg[guildId].seasons),
              categoryOpts = getOptions(regexGroups[3], serverCfg[guildId].categories),
              stageOpts = getOptions(regexGroups[4], serverCfg[guildId].stages);
        if (!seasonOpts.length || !categoryOpts.length || !stageOpts.length) return botMsg.edit(createEmbed('Incorrect season, mode or map.', 'Error', guildId));
            
        const { option: season } = seasonOpts.length === 1 ? {option:seasonOpts[0]} : await getUserReaction(msg.author, botMsg, seasonOpts);
        if (!season) return botMsg.edit(createEmbed('No season selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const { option: category } = categoryOpts.length === 1 ? {option:categoryOpts[0]} : await getUserReaction(msg.author, botMsg, categoryOpts);
        if (!category) return botMsg.edit(createEmbed('No category selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const { option: stage } = stageOpts.length === 1 ? {option:stageOpts[0]} : await getUserReaction(msg.author, botMsg, stageOpts);
        if (!stage) return botMsg.edit(createEmbed('No map selected.', 'Timeout', guildId)), videoMsg.delete();
            
        const runsPreProc = (await getAllSubmits(serverCfg[guildId].googleSheets.submit[season][category].id, serverCfg[guildId].googleSheets.submit[season][category].range)).filter(run => run.category === category && run.stage === stage).sort((a, b) => Number(a.time) - Number(b.time));
        if (!runsPreProc.length) return botMsg.edit(createEmbed('No submits found.', 'Error', guildId)), videoMsg.delete();
            
        let runs = [];
        for (let run of runsPreProc) {
            if (runs.some(value => value.name === run.name)) continue;
            else runs.push(run);
        }
        if (!runs.length) return botMsg.edit(createEmbed(`No runs found`, 'Warning', guildId)), videoMsg.delete();
        let prevTime = 0.00, place = 0, placeCount = 1, reactionOpts = [];
        for (let run of runs) {
            if (Number(run.time) > prevTime || runs.indexOf(run) === 1) {
                place += placeCount;
                placeCount = 1;
            } else placeCount+=1;
            run.place = place;
            prevTime = Number(run.time);
            reactionOpts.push(`${run.place} *${run.name} - ${run.time} - [link](${run.proof})*`);
        }
        const { index } = await getUserReaction(msg.author, botMsg, reactionOpts, '✅ **Leaderbaord**');
        if (index === undefined) {
            videoMsg.delete();
            let embedDescription = botMsg.embeds[0].description;
            embedDescription = embedDescription.replace(/1️⃣\s*|2️⃣\s*|3️⃣\s*|4️⃣\s*|5️⃣\s*/g, '');
            let embed = new Discord.MessageEmbed(botMsg.embeds[0]);
            embed.setDescription(embedDescription);
            embed.setColor(guildCfg.embeds.Success.color);
            botMsg.edit({embed});
            return;
        }
        const placeRun = runs[index];
        const wrTime = Number(runs[0].time), placeTime = Number(placeRun.time);
        let normalizedTime;
        if ((normalizedTime = 1-((placeTime-wrTime)/wrTime)) < 0) normalizedTime = 0;
        const points = Math.round((0.4*Math.pow(normalizedTime, 25)+0.05*Math.pow(normalizedTime, 4)+0.25*Math.pow(normalizedTime, 3)+0.3*Math.pow(normalizedTime, 2))*100 + getMapPoints(stage, category) + getPlacePoints(placeRun.place));
        
        botMsg.edit('', createEmbed(`**Place**\nRank: *${placeRun.place}*\nTime: *${placeRun.time}*\nPoints: *${points}*\nUser: *${placeRun.name}*`, 'Success', guildId));
        videoMsg.edit(placeRun.proof);
    } catch (err) {
        videoMsg.delete();
        botMsg.edit('', createEmbed('An error occurred while handling your command.', 'Error', msg.guild.id));
        console.log('Error in leaderbaord: ' + err.message);
        console.log(err.stack);
    }
}