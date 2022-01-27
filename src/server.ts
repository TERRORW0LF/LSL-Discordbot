import axios from 'axios';
import express from 'express';
import { Client, Intents } from 'discord.js';
import { discordToken, port } from './config/config';
import commandCollection from './commands/commandCollection';
import guildsConfig from './config/guildConfig.json';

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
        axios.get('https://lsl-discordbot-v12.herokuapp.com/ping').catch(err => { return });
        axios.get('https://discord-lsl.herokuapp.com/ping').catch(err => { return });
    }, 600000);
});

// Discord Client
const client = new Client({ restTimeOffset: 100, partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.once('ready', (client) => { 
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        try {
            if (!interaction.inGuild()) {
                interaction.reply({ embeds: [{ description: 'This bot does not support DM commands.', color: guildsConfig.default.embeds.error }] });
                return;
            }
            const command = commandCollection.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        } catch (err) {
            const payload = { content: '', embeds: [{description: 'Something went wrong!', color: guildsConfig.default.embeds.error }] };
            if (interaction.deferred || interaction.replied)
                interaction.editReply(payload);
            else
                interaction.reply(payload);
        }
        return;
    }
});

client.login(discordToken);