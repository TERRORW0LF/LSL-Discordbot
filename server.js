'use strict';

const axios = require('axios');
const path = require('path');
const express = require('express');
const app = express();
const Discord = require('discord.js');

const commands = require('./commands.json');
const serverCfg = require('./Config/serverCfg.json');
const { createEmbed } = require('./Util/misc')
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

    const msgContent = msg.content.replace(prefix, '').trim();
    for (let command of commands.commandList) {
        let pattern = new RegExp(command.regex, "iu");
        if (!pattern.test(msgContent)) continue;

        await msg.member.fetch();
        if (!msg.member.hasPermission('ADMINISTRATOR')) {
            //Check if channel is allowed
            let commandCfg;
            commandCfg = guildCfg?.channels?.commands?.[command.group]?.[command.name] ?? serverCfg.default.channels.commands?.[command.group]?.[command.name];
            if (!commandCfg) commandCfg = guildCfg?.channels?.commands?.[command.group] ?? serverCfg.default.channels.commands?.[command.group];
            if (!commandCfg) commandCfg = guildCfg?.channels?.commands?.default ?? serverCfg.default.channels.commands.default;
            if (commandCfg.include)
                if (!commandCfg.include.some(channel => msg.channel.id === channel))
                    return msg.channel.send(createEmbed(`Please post commands in the designated channels.`, `Error`, msg.guild.id));
            if (commandCfg.exclude)
                if (commandCfg.exclude.some(channel => msg.channel.id === channel))
                    return msg.channel.send(createEmbed(`Please post commands in the designated channels.`, `Error`, msg.guild.id));
            
            //Check if User/Member has permission to execute the command
            let permissionCfg;
            permissionCfg = guildCfg?.permissions?.[command.group]?.[command.name] ?? serverCfg.default.permissions?.[command.group]?.[command.name];
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.[command.group] ?? serverCfg.default.permissions?.[command.group];
            if (!permissionCfg) permissionCfg = guildCfg?.permissions?.default ?? serverCfg.default.permissions.default;
            if (permissionCfg.include) {
                let hasPermission = false;
                for (let role of permissionCfg.include) {
                    if (msg.member.roles.cache.has(role))
                        hasPermission = true;
                }
                if (!hasPermission)
                    return msg.channel.send(createEmbed(`missing permission.`, 'Error', msg.guild.id));
            }
            if (permissionCfg.exclude) 
                for (let role of permissionCfg.exclude) 
                    if (msg.member.roles.cache.has(role)) 
                        return msg.channel.send(createEmbed(`missing permission.`, 'Error', msg.guild.id));
        }

        // Execute command
        const run = require(`./${command.path}`);
        run(msg, client, pattern.exec(msgContent));
        return;
    }
    msg.channel.send(createEmbed(`No matching command found.`, `Error`, msg.guild.id));
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

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!serverCfg[newPresence.guild.id]) return;
    const featureCfg = serverCfg[newPresence.guild.id].features;
    if (featureCfg.streaming.enabled)
        require('./Features/Streaming/streamingRole')(oldPresence, newPresence);
});

client.on('guildMemberAdd', async member => {
    await member.fetch();
    if (!serverCfg[member.guild.id]) return;
    const autoRolesCfg = serverCfg[member.guild.id].features.autoRoles;
    for (let role of autoRolesCfg) 
        member.roles.add(role).catch(err => {});
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