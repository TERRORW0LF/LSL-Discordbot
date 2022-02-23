import express from 'express';
import { Client, Intents } from 'discord.js';
import { discordToken, herokuAuth, port } from './config/config.js';
import commandCollection from './commands/commandCollection.js';
import interactionCreate from './events/discord/interactionCreate.js';
import ready from './events/discord/ready.js';
import submit from './events/server/submit.js';
import remove from './events/server/delete.js';
import ping from './events/server/ping.js';
import listen from './events/server/listen.js';
import guildMemberAdd from './events/discord/guildMemberAdd.js';
import guildMemberUpdate from './events/discord/guildMemberUpdate.js';
import axios from 'axios';

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

// API
const app = express();

app.use(express.json());
app.get('/ping', (...args) => ping(...args));
app.post('/submit', (...args) => submit(client, ...args));
app.post('/delete', (...args) => remove(client, ...args));

app.listen(port, (...args) => listen(...args));

setInterval(async () => {
    axios.get(`https://lsl-discordbot-v12.herokuapp.com/ping?auth=${herokuAuth}`).catch(err => { });
    axios.get(`https://discord-lsl.herokuapp.com/ping?auth=${herokuAuth}`).catch(err => { });
}, 1200000);

// Discord Client
const client = new Client({ restTimeOffset: 100, partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.once('ready', (...args) => ready(...args));
client.on('interactionCreate', async (...args) => interactionCreate(commandCollection, ...args));
client.on('guildMemberAdd', async (...args) => guildMemberAdd(...args));
client.on('guildMemberUpdate', async (...args) => guildMemberUpdate(...args));

client.login(discordToken);