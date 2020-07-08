'use strict';

const axios = require('axios');
const path = require('path');
const express = require('express');
const app = express();

const { setGoogleAuth } = require('./google-auth');
const { setDiscordClient, getDiscordClient } = require('./discord-auth');
const newSubmit = require('./Util/newSubmit');
const newDelete = require('./Util/newDelete');
const { setPbCache } = require('./Util/pbCache');
const { setWrCache } = require('./Util/wrCache');
const handleMessage = require('./HandleCommands/messages');

let client;
getDiscordClient().then((value) => {
    client = value;
    console.log(client);

    client.on('ready', () => {
        console.log('Discord bot up and running!');
    });
});

process.on('unhandledRejection', err => {
	console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception: ', err)
  process.exit(1);
});

const P = process.env.PORT ||  3000;

(async function init () {
    try {
        app.use(express.json());

        if (!process.env.PORT) require('dotenv').config();
        await Promise.all([
            setDiscordClient(),
            setGoogleAuth(),
            setWrCache(),
            setPbCache()
        ]);
        console.log(`
            ::bot login::
            ::gAuth set::
            ::WR cached::
            ::PB cached::
        `);
        console.log(client);
        client.on('message', handleMessage);
        app.post('/submit', newSubmit(client));
        app.post('/delete', newDelete(client));
	app.get('/ping', (req, res) => {
      	    if(req.query.auth !== process.env.herokuAUTH) {
                res.sendStatus(403);
                return;
            }
      	    console.log('\nping\n');
      	    res.sendStatus(200);
      	    return;
        });

        app.listen(P, () => console.log('app running on PORT: ', P));
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
