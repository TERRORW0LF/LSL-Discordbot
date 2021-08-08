'use strict'

import { discordToken } from './config';
import { Express } from 'express';
import { Client, Intents } from 'discord.js';

const app = Express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

    client.on('ready', () => { 
        console.log(`Logged in as ${client.user.tag}!`) 
    });

client.login(discordToken);