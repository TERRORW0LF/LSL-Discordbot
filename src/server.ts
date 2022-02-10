import axios from 'axios';
import express from 'express';
import { Client, Intents } from 'discord.js';
import { discordToken, port } from './config/config';
import commandCollection from './commands/commandCollection';
import interactionCreate from './events/discord/interactionCreate';
import ready from './events/discord/ready';
import submit from './events/server/submit';
import remove from './events/server/delete';
import ping from './events/server/ping';
import listen from './events/server/listen';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

//TODO: outsource events into their own files.

// API
const app = express();

app.get('/ping', (...args) => ping(...args));
app.post('/submit', (...args) => submit(client, ...args));
app.post('/delete', (...args) => remove(client, ...args));

app.listen(port, (...args) => listen(...args));

// Discord Client
const client = new Client({ restTimeOffset: 100, partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.once('ready', (...args) => ready(...args));
client.on('interactionCreate', async (...args) => interactionCreate(commandCollection, ...args));

client.login(discordToken);