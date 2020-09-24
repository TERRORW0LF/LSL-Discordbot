module.exports = { addTimeout, deleteTimeout };

let timeouts = new Map();

async function addTimeout(id, timeout) {
    timeouts.set(id, timeout);
    return true;
}

async function deleteTimeout(id) {
    try {
        const timeout = timeouts.get(id);
        clearTimeout(timeout);
        return timeouts.delete(id);
    } catch(err) { console.log(err); }
}