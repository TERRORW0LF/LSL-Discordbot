const roleUpdate = require('./roleUpdate');

module.exports = newDelete;

function newDelete(client) {
    return async (req, res) => {
        if (req.query.auth !== process.env.herokuAUTH) {
            res.sendStatus(403);
            return;
        }
        try {
            res.sendStatus(200);
            const guild = client.guilds.get(process.env.DiscordGUILD);
            setWrCache();
            setPbCache();
            roleUpdate(guild, req.body.season);
        } catch (err) {
            console.log('An error occured in newDelete: '+err.message);
            console.log(err.stack);
        }
    }
}
