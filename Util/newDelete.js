'use strict';

const roleUpdate = require('./roleUpdate');

module.exports = newDelete;

function newDelete(client) {
    return async (req, res) => {
        if (req.query.auth !== process.env.herokuAUTH) {
            res.sendStatus(403);
            return;
        }
        try {
            const guild = client.guilds.cache.get(req.body.id);
            roleUpdate(guild, req.body.season);
            res.sendStatus(200);
        } catch (err) {
            console.log('An error occured in newDelete: '+err.message);
            console.log(err.stack);
        }
    }
}
