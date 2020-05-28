module.exports = getSeasonOptions;

function getSeasonOptions(season) {
    switch(season) {
        case '1': return 'season1';
        case '2': return 'season2';
        case '3': return 'season3';
        case '4': return 'season4';
        default: return;
    }
}
