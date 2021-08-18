'use strict'

import { discordToken, port } from './config/config.js';
import https from 'https';
import express from 'express';
import { Client, Intents, Collection } from 'discord.js';
import fs from 'fs';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

// API
const app = express();

app.get('/ping', (req, res) => {
    console.log('\nping\n');
    res.sendStatus(200);
});
app.post('/submit', (req, res) => {
    if (!client.isReady()) res.sendStatus(500);
});

app.post('/delete', (req, res) => {
    if (!client.isReady()) res.sendStatus(500);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    setInterval(() => {
        https.get('https://lsl-discordbot-v12.herokuapp.com/ping');
        https.get('https://discord-lsl.herokuapp.com/ping');
    }, 600000);
});

// Discord Client
const client = new Client({ restTimeOffset: 100, partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/top level').filter(file => file.endsWith('.js'));
for (let file of commandFiles) {
    import command from `./commands/top level/${file}`;
    client.commands.set(command.data.name, command);
}

client.once('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        try {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        } catch (err) {
            if (interaction.deferred)
                interaction.editReply({content: '', embeds: [{description: 'Something went wrong!'}]});
            else
                interaction.reply({content: '', embeds: [{description: 'Something went wrong!'}]});
        }
    }
});

client.login(discordToken);