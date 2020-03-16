const strcomp = require('string-similarity');

module.exports = getModeOptions;

function getModeOptions(mode) {
    const d = strcomp.findBestMatch(mode, ['Gravspeed', 'Standard']);
    if (d.bestMatch.rating < 0.35) return;
    return d.bestMatch.target;
}
