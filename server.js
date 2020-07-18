'use strict';

const axios = require('axios');
const path = require('path');
const express = require('express');
const app = express();
const Discord = require('discord.js');

const commands = require('./commands.json');
const { setGoogleAuth } = require('./google-auth');
const newSubmit = require('./Util/newSubmit');
const newDelete = require('./Util/newDelete');
const { setPbCache } = require('./Util/pbCache');
const { setWrCache } = require('./Util/wrCache');

const prefix = '!';

// Process unhandled errors
process.on('unhandledRejection', err => {
	console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception: ', err)
  process.exit(1);
});


// Start Discord bot
const client = new Discord.Client();
client.login(process.env.discordTOKEN);
client.on('ready', () => {
    console.log('Discord bot up and running!');

    // Discord events
    client.on('message', msg => {
        if (msg.content.startsWith(prefix) && !msg.author.bot) {
            let answered = false;
            for (let command of commands.commandList) {
                let pattern = new RegExp(command.regex, "i");
                if (pattern.test(msg.content.trim())) {
                    // Implement permission handling (channel / role)
                    require(`./${command.path}`).run(msg, client, pattern.exec(msg.content.trim()));
                    answered = true;
                }
            }
            if (!answered) msg.channel.send("❌ No matching command found.")
        }
    });

    // Initialize webhooks handling submits and deletes to google sheets.
    app.post('/submit', newSubmit(client));
    app.post('/delete', newDelete(client));
});


// Process app / Webhook listener
const P = process.env.PORT ||  3000;

(async function init () {
    try {
        // Start Webhooks listener.
        app.use(express.json());
        if (!process.env.PORT) require('dotenv').config();
        await Promise.all([
            setGoogleAuth(),
            setWrCache(),
            setPbCache()
        ]);
        console.log(`
            ::gAuth set::
            ::WR cached::
            ::PB cached::
        `);

        app.listen(P, () => console.log('app running on PORT: ', P));

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
    if (!process.env.PORT) return;
    setInterval(async () => {
        axios.get(`https://discord-lsl.herokuapp.com/ping?auth=${process.env.herokuAUTH}`);
    }, 1700000);
}