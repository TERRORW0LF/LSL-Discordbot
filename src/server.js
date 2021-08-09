'use strict'

import { discordToken, port } from './config/config.js';
import https from 'https';
import express from 'express';
import { Client, Intents } from 'discord.js';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const app = express();

app.get('/ping', (req, res) => {
    console.log('\nping\n');
    res.sendStatus(200);
});
app.get('/submit', (req, res) => { 
    if (!client.isReady()) res.sendStatus(404);
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.once('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    setInterval(() => {
        https.get('https://lsl-discordbot-v12.herokuapp.com/ping');
        https.get('https://discord-lsl.herokuapp.com/ping');
    }, 600000);
});
client.login(discordToken);