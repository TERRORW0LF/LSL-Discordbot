const roleUpdate = require('./roleUpdate');
const { setWrCache } = require('./wrCache');
const { setPbCache } = require('./pbCache');

module.exports = newDelete2;

function newDelete2(message) {
    try {
        const guild = message.guild;
        setWrCache();
        setPbCache();
        roleUpdate(guild);
    } catch (err) {
        console.log('An error occured in newDelete: '+err.message);
        console.log(err.stack);
    }
}