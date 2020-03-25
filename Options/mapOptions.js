const strcomp = require('string-similarity');

module.exports = getMapOptions;

function getMapOptions(map) {
    const mapOptions = ['Hanamura','Horizon Lunar Colony','Paris','Temple of Anubis','Volskaya Industries','Dorado','Havana','Junkertown','Rialto',
    'Route 66','Gibraltar','Blizzard World','Eichenwalde','Hollywood',"King's Row",'Numbani', 'Busan Sanctuary','Busan MEKA Base',
    'Busan Downtown','Ilios Well','Ilios Ruins','Ilios Lighthouse','Lijiang Night Market','Lijiang Garden','Lijiang Control Center',
    'Nepal Village','Nepal Sanctum','Nepal Shrine','Oasis City Center','Oasis University','Oasis Gardens'];
    const mapOptionsLow = mapOptions.map(str => str.toLowerCase());
    var opts = [];
    var redMapOpts = mapOptions;
    var redMapOptsLow = mapOptionsLow;
    for (i = 0; i < 5; i++) {
        const d = strcomp.findBestMatch(map.toLowerCase(), redMapOptsLow);
        if (d.bestMatch.rating < 0.35) return opts;
        opts.push(redMapOpts[d.bestMatchIndex]);
        if (d.bestMatch.rating > 0.7) return opts;
        redMapOpts.splice(d.bestMatchIndex, 1);
        redMapOptsLow.splice(d.bestMatchIndex, 1);
    }
    return opts;
}
