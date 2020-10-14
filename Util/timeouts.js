module.exports = { addTimeout, deleteTimeout };

let timeouts = new Map();

function addTimeout(id, timeout) {
    timeouts.set(id, timeout);
    return true;
}

function deleteTimeout(id) {
    try {
        const timeout = timeouts.get(id);
        clearTimeout(timeout);
        return timeouts.delete(id);
    } catch(err) { console.log(err); }
}