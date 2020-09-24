module.exports = { addTimeout, deleteTimeout };

let timeouts = new Map();

async function addTimeout(id, timeout) {
    timeouts.set(id, timeout);
    return true;
}

async function deleteTimeout(id) {
    const timeout = timeouts.get(id);
    clearTimeout(timeout);
    return timeouts.delete(id);
}