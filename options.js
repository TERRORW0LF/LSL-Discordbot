const strcomp = require('string-similarity');
const serverCfg = require('./Config/serverCfg.json');

module.exports = {getSeasonOptions, getModeOptions, getMapOptions};

function getSeasonOptions(season, id) {
    return serverCfg[id].seasons.find(value => value === season) ? season : undefined;
}


function getModeOptions(mode, id) {
    console.log(serverCfg[id].categories);
    const modes = serverCfg[id].categories,
          modesLow = categories.map(category => category.toLowerCase());
    console.log(categories);
    let opts = [];
    for (i = 0; i < 5 && modes.length; i++) {
        const d = strcomp.findBestMatch(mode.toLowerCase(), modesLow);
        if (d.bestMatch.rating < 0.35) return opts;
        opts.push(modes[d.bestMatchIndex]);
        if (d.bestMatch.rating > 0.7) return opts;
        modes.splice(d.bestMatchIndex, 1);
        modesLow.splice(d.bestMatchIndex, 1);
    }
    return opts;
}


function getMapOptions(stage, id) {
    console.log(serverCfg[id].stages);
    const maps = serverCfg[id].stages,
          mapsLow = maps.map(str => str.toLowerCase());
    console.log(maps);
    let opts = [];
    for (i = 0; i < 5 && maps.length; i++) {
        const d = strcomp.findBestMatch(stage.toLowerCase(), mapsLow);
        if (d.bestMatch.rating < 0.35) return opts;
        opts.push(maps[d.bestMatchIndex]);
        if (d.bestMatch.rating > 0.7) return opts;
        maps.splice(d.bestMatchIndex, 1);
        mapsLow.splice(d.bestMatchIndex, 1);
    }
    return opts;
}