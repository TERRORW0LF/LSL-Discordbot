const sendSubmit = require('./sendSubmit');
const sendWr = require('./sendWR');
const roleUpdate = require('./roleUpdate');
const { getAllSubmits } = require('./misc');

module.exports = newSubmit;

function newSubmit(client) {
    return async (req, res) => {
        if (req.query.auth !== process.env.herokuAUTH) {
            res.sendStatus(403);
            return;
        }
        try {
            const guild = discord.guilds.get(req.body.id);
            sendSubmit(guild, req.body);
            const wr = (await getAllSubmits(process.env[`gSheetS${req.body.season}`], 'Record Log!A2:F')).filter(submit => submit.category === req.body.mode && submit.stage === req.body.map).sort((a, b) => a.time - b.time)[0];
            if (!wr || wr.time > req.body.time) {
                console.log(`New Record: ${req.body.season}, ${req.body.mode}, ${req.body.map}, ${req.body.user}, ${req.body.time}, ${req.body.link}`);
                sendWr(client, req.body, wr);
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
