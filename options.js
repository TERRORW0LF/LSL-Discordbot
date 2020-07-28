const strcomp = require('string-similarity');
const serverCfg = require('./Config/serverCfg.json');

module.exports = {getSeasonOptions, getModeOptions, getMapOptions};

function getSeasonOptions(season, id) {
    return serverCfg[id].seasons.find(value => value === season) ? season : undefined;
}


function getModeOptions(mode, id) {
    const categories = serverCfg[id].categories,
          categoriesLow = categories.map(category => category.toLowerCase());
    let opts = [];
    for (i = 0; i < 5 && i < categories.length; i++) {
        const d = strcomp.findBestMatch(mode.toLowerCase(), categoriesLow);
        if (d.bestMatch.rating < 0.35) return opts;
        opts.push(categories[d.bestMatchIndex]);
        if (d.bestMatch.rating > 0.7) return opts;
        categories.splice(d.bestMatchIndex, 1);
        categoriesLow.splice(d.bestMatchIndex, 1);
    }
    return opts;
}


function getMapOptions(stage, id) {
    const maps = serverCfg[id].stages,
          mapsLow = maps.map(str => str.toLowerCase());
    let opts = [];
    for (i = 0; i < 5 && i < maps.length; i++) {
        const d = strcomp.findBestMatch(stage.toLowerCase(), mapsLow);
        if (d.bestMatch.rating < 0.35) return opts;
        opts.push(maps[d.bestMatchIndex]);
        if (d.bestMatch.rating > 0.7) return opts;
        maps.splice(d.bestMatchIndex, 1);
        mapsLow.splice(d.bestMatchIndex, 1);
    }
    return opts;
}