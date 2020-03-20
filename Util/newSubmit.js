const sendSubmit = require('./sendSubmit');
const sendWr = require('./sendWR');
const roleUpdate = require('./roleUpdate');
const { getWrCache, updateWrCache }  = require('./wrCache');
const { getPbCache, updatePbCache } = require('./pbCache');

module.exports = newSubmit;

function newSubmit(discord) {
    return async (req, res) => {
        if (req.query.auth !== process.env.herokuAUTH) {
            res.sendStatus(403);
            return;
        }
        try {
            await sendSubmit(discord, req.body);
            const guild = discord.guilds.get(process.env.DiscordGUILD);
            const wrCache = await getWrCache();
            const pbCache = await getPbCache();
            if (!wrCache[req.body.season][req.body.mode][req.body.map] || Number(req.body.time) < Number(wrCache[req.body.season][req.body.mode][req.body.map]['time'])) {
                console.log(`New Record: ${req.body.season}, ${req.body.mode}, ${req.body.map}, ${req.body.time}, ${req.body.link}`);
                const data = await getOldWrData(wrCache, req.body);
                await sendWr(discord, data);
                await updateWrCache(req.body);
            }
            if (!pbCache[req.body.season][req.body.mode][req.body.map] || !pbCache[req.body.season][req.body.mode][req.body.map][req.body.user] || Number(req.body.time) < Number(pbCache[req.body.season][req.body.mode][req.body.map][req.body.user]['time'])) {
                console.log(`New PB: ${req.body.season}, ${req.body.mode}, ${req.body.map}, ${req.body.user}, ${req.body.time}, ${req.body.link}`);
                await updatePbCache(req.body);
            }
            if (req.body.season === 'season3') roleUpdate(guild);
            res.sendStatus(200);
        } catch (err) {
            console.log('An error occurred in newSubmit: ' + err.message);
            console.log(err.stack);
            res.sendStatus(500);
        }
    }
}

async function getOldWrData (cache, newRecord) {
    const oldWr = cache[newRecord.season][newRecord.mode][newRecord.map];
    if (oldWr) {
        return {
            ...newRecord,
            oldTime: oldWr.time,
            oldUser: oldWr.user,
            oldDate: oldWr.date
        }
    } else {
        return {
            ...newRecord,
            oldTime: 'None',
            oldUser: 'None',
            oldDate: 'None'
        }
    }
}
