module.exports = getSeasonOptions;

function getSeasonOptions(season) {
    switch(season) {
        case '1': return 'season1';
        case '2': return 'season2';
        case '3': return 'season3';
        default: return;
    }
}