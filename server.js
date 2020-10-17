'use strict';

const axios = require('axios');
const path = require('path');
const express = require('express');
const app = express();
const Discord = require('discord.js');

const commands = require('./commands.json');
const serverCfg = require('./Config/serverCfg.json');
const { setGoogleAuth } = require('./google-auth');
const { deleteTimeout } = require('./Util/timeouts');
const newSubmit = require('./Util/newSubmit');
const newDelete = require('./Util/newDelete');

// Process unhandled errors
process.on('unhandledRejection', err => {
	console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception: ', err)
  process.exit(1);
});


// Start Discord bot
const client = new Discord.Client({partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'REACTION']});
client.login(process.env.discordTOKEN);

// Discord events
client.once('ready', () => {
    client.user.setActivity('failing', { type: 'PLAYING' });
    console.log('Discord bot up and running!');
});

client.on('message', async msg => {
    const guildCfg = serverCfg[msg.guild.id] || serverCfg.default;
    const prefix = guildCfg.prefix;
    if (!msg.content.startsWith(prefix) || msg.author.bot) 
        return;
    let answered = false;
    for (let command of commands.commandList) {
        let pattern = new RegExp(command.regex, "iu");
        if (pattern.test(msg.content.replace(prefix, '').trim())) {
            let commandCfg;
            if (guildCfg.channels.commands[command.group] && guildCfg.channels.commands[command.group][command.name])
                commandCfg = guildCfg.channels.commands[command.group][command.name];
            else if (guildCfg.channels.commands[command.group])
                commandCfg =  guildCfg.channels.commands[command.group].default;
            else commandCfg = guildCfg.channels.commands.default;
            if (commandCfg.include.length)
                if (!commandCfg.include.some(channel => msg.channel.id === channel))
                    return msg.channel.send('please post commands in the designated channels.');
            if (commandCfg.exclude.length)
                if (commandCfg.exclude.some(channel => msg.channel.id === channel))
                    return msg.channel.send('please post commands in the designated channels.');
            const permission = guildCfg.permissions[command.group];
            if (permission) {
                let hasPermission = false;
                for (let role of permission) {
                    if (msg.member.roles.cache.has(role))
                        hasPermission = true;
                }
                if (!hasPermission)
                    break;
            }
            const run = require(`./${command.path}`);
            run(msg, client, pattern.exec(msg.content.replace(prefix, '').trim()));
            answered = true;
            break;
        }
    }
    if (!answered)
        msg.channel.send("❌ No matching command found / missing permission.");
});

client.on('messageReactionAdd', async (reaction, user) => {
    await Promise.all([
        reaction.fetch(),
        reaction.message.fetch(),
        user.fetch()
    ]);
    require('./Features/Starboard/addedStar')(reaction, user);
    require('./Features/ReactionRoles/addedReaction')(reaction, user);
});

client.on('messageReactionRemove', async (reaction, user) => {
    await Promise.all([
        reaction.fetch(),
        reaction.message.fetch(),
        user.fetch()
    ]);
    require('./Features/Starboard/removedStar')(reaction, user);
    require('./Features/ReactionRoles/removedReaction')(reaction, user);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!serverCfg[newPresence.guild.id]) return;
    const featureCfg = serverCfg[newPresence.guild.id].features;
    if (featureCfg.streaming.enabled) {
        const run = require('./Features/Streaming/streamingRole');
        run(oldPresence, newPresence);
    }
});

client.on('guildMemberRemove', member => {
    deleteTimeout("mute"+member.guild.id+member.id);
});

// Process app / Webhook listener
const P = process.env.PORT ||  3000;

(async function init () {
    try {
        // Start Webhooks listener.
        app.use(express.json());
        await setGoogleAuth();
        console.log(`Google JWT created.`);

        app.listen(P, () => console.log('app running on PORT: ', P));

        // Initialize webhooks handling submits and deletes to google sheets.
        app.post('/submit', newSubmit(client));
        app.post('/delete', newDelete(client));
        // Webhook to keep the bot awake (Fuck you Heroku).
        app.get('/ping', (req, res) => {
            if(req.query.auth !== process.env.herokuAUTH) {
                res.sendStatus(403);
                return;
            }
            console.log('\nping\n');
            res.sendStatus(200);
            return;
        });

        // Ping in 28min interval
        pingSelf();
    } catch (err) {
        console.log('An error occurred in server.js: ' + err.message);
        console.log(err.stack);
        process.exit(1);
    }
})(); 


function pingSelf () {
    if (!process.env.PORT) 
        return;
    setInterval(async () => {
        axios.get(`https://lsl-discordbot-v12.herokuapp.com/ping?auth=${process.env.herokuAUTH}`).catch(err => { });
        axios.get(`https://discord-lsl.herokuapp.com/ping?auth=${process.env.herokuAUTH}`).catch(err => { });
    }, 1200000);
}