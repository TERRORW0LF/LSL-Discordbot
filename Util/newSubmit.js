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
            const guild = client.guilds.cache.get(req.body.id);
            sendSubmit(guild, req.body);
            const wr = (await getAllSubmits(serverCfg[guild.id].googleSheets.submit[req.body.season][req.body.category].id, serverCfg[guild.id].googleSheets.submit[req.body.season][req.body.category].range)).filter(submit => submit.category === req.body.category && submit.stage === req.body.stage).sort((a, b) => Number(a.time) - Number(b.time))[0];
            if (!wr || Number(wr.time) > Number(req.body.time)) {
                console.log(`New Record: ${req.body.season}, ${req.body.category}, ${req.body.stage}, ${req.body.name}, ${req.body.time}, ${req.body.proof}`);
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
