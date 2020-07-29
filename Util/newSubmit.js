const sendSubmit = require('./sendSubmit');
const sendWr = require('./sendWR');
const roleUpdate = require('./roleUpdate');
const { getAllSubmits } = require('./misc');
const serverCfg = require('../Config/serverCfg.json');

module.exports = newSubmit;

function newSubmit(client) {
    return async (req, res) => {
        if (req.query.auth !== process.env.herokuAUTH) {
            res.sendStatus(403);
            return;
        }
        try {
            const guild = client.guilds.get(req.body.id);
            sendSubmit(guild, req.body);
            const wr = (await getAllSubmits(serverCfg[guild.id].googleSheets.submit[req.body.season][req.body.category].id, serverCfg[guild.id].googleSheets.submit[req.body.season][req.body.category])).filter(submit => submit.category === req.body.category && submit.stage === req.body.stage).sort((a, b) => a.time - b.time)[0];
            if (!wr || wr.time > req.body.time) {
                console.log(`New Record: ${req.body.season}, ${req.body.mode}, ${req.body.map}, ${req.body.name}, ${req.body.time}, ${req.body.link}`);
                sendWr(client, wr, req.body);
            }
            roleUpdate(guild, req.body.season);
            res.sendStatus(200);
        } catch (err) {
            console.log('An error occurred in newSubmit: ' + err.message);
            console.log(err.stack);
            res.sendStatus(500);
        }
    }
}
