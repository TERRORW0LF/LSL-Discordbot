const roleUpdate = require('./roleUpdate');

module.exports = newDelete2;

function newDelete2(message, season) {
    try {
        const guild = message.guild;
        setWrCache();
        setPbCache();
        roleUpdate(guild, season);
    } catch (err) {
        console.log('An error occured in newDelete: '+err.message);
        console.log(err.stack);
    }
}
