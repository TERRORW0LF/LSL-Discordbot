import { Run } from "./sheets";

/**
 * Sorts the runs by time and if the time is equal by submit date.
 * This methods transforms the original array and returns the transformed original array.
 * @param runs The runs to sort.
 * @returns The sorted runs.
 */
 export function sortRuns(runs: Run[]): Run[] {
    runs.sort((run1, run2) => {
        const timeDiff = run1.time - run2.time;
        return timeDiff ? timeDiff : run1.date.getTime() - run2.date.getTime();
    });
    return runs;
}


/**
 * Filters an array so that only pbs are left. Each combo of:
 * patch, season, category, map, and user
 * has its own pb.
 * @param runs The runs to extract the pbs out of.
 * @returns An array consisting only of the pbs in the runs array.
 */
 export function pbsOnly(runs: Run[]): Run[] {
    const pbs: Run[] = [];
    for (const run of runs) {
        const index = pbs.findIndex(run1 => 
            run1.patch === run.patch
            && run1.season === run.season
            && run1.category === run.category
            && run1.map === run.map
            && run1.username === run.username
        );
        if (index === -1) {
            pbs.push(run);
            continue;
        }
        if (run.time < pbs[index].time || (run.time === pbs[index].time && run.date.getTime() < pbs[index].date.getTime()))
            pbs[index] = run;
    }
    return pbs;
}


export interface RunWithPlaceAndPoints extends Run {
    place: number,
    points: number
}

/**
 * Adds place and points to the given runs. The returned runs are also sorted and incluce only pbs.
 * Place and points are missing from the runs returned in getAllSubmits bc their calculation are quite resource intensive
 * and should only be done if necessary.
 * @param pbs The runs the add the place and points to.
 * @returns The runs with their respective place and points.
 */
export function addPlaceAndPoints(runs: Run[]): RunWithPlaceAndPoints[] {
    const pbs = pbsOnly(sortRuns(runs));

    const mappedRuns = pbs.map<RunWithPlaceAndPoints>(run => {
        const sameMap = pbs.filter(run1 => run1.patch === run.patch 
            && run1.season === run.season 
            && run1.category === run.category
            && run1.map === run.map);
        const wr = sameMap[0];
        const place = getPlace(run, wr, sameMap);
        const points = getPoints(run, wr, place, run.map, run.category);
        return { ...run, place, points };
    });
    return mappedRuns;
}


/**
 * Gets the place of the run in the given runs.
 * This function assumes that the given runs include only pbs on the same map as the run.
 * No guarantees are made to the validity of the result if these conditions are not fulfilled.
 * @param run The run to get the place of.
 * @param runs The other runs on the same map.
 * @returns The place of the run in the runs.
 */
export function getPlace(run: Run, wr: Run, runs: Run[]): number {
    let place = runs.filter(run1 => run1.time - run.time < 0.0002).length + 1;
    if (place === 1 && run.submitId !== wr.submitId) place = 2;
    return place;
}


/**
 * Gets the points of a run.
 * @param run The run to get the points of.
 * @param wr The wr on the map.
 * @param place The place of the run.
 * @param map The map of the run.
 * @param category The category of the run.
 * @returns The overall points the run has achieved.
 */
export function getPoints(run: Run, wr: Run, place: number, map: string, category: string) {
    return getPercentilePoints(run, wr) + getMapBasePoints(map, category) + getPlacePoints(place);
}


/**
 * Gets the percentile points of a run.
 * @param run The run to get the points of.
 * @param wr The wr on the map.
 * @returns The percentile points the run has achieved.
 */
export function getPercentilePoints(run: Run, wr: Run) {
    let normalizedTime: number;
    if ((normalizedTime = 1 - ((run.time - wr.time) / wr.time)) < 0) normalizedTime = 0;
    return Math.round((0.4 * normalizedTime**25 + 0.05 * normalizedTime**4 + 0.25 * normalizedTime**3 + 0.3 * normalizedTime**2) * 100);
}


/**
 * Gets the base points for submitting a run.
 * @param map The map.
 * @param category The category.
 * @returns The base points for the map / category combination.
 */
export function getMapBasePoints(map: string, category: string) {
    let points;
    if (['Gibraltar', 'Havana', 'Rialto', 'Route66'].includes(map)) points = 80;
    else if (['Lijiang Control Center', 'Hollywood', 'Eichenwalde', 'Busan MEKA Base'].includes(map)) points = 70;
    else if (['Volskaya Industries', 'Paris', 'Numbani', 'Nepal Shrine', 'Nepal Sanctum', 'Lijiang Night Market', 'King\'s Row', 'Junktertown', 'Horizon Lunar Colony', 'Hanamura', 'Dorado'].includes(map)) points = 60;
    else if (['Temple of Anubis', 'Oasis University', 'Oasis City Center', 'Nepal Village', 'Lijiang Garden', 'Ilios Well', 'Illios Ruins', 'Illios Lighthouse', 'Busan Sanctuary', 'Busan Downtown', 'Blizzard World'].includes(map)) points = 50;
    else points = 40;
    return category === 'Standard' ? points : points / 2;
}


/**
 * Gets the points for achieving the given place.
 * @param place The place.
 * @returns The points for achieving the place.
 */
export function getPlacePoints(place: number) {
    switch(place) {
        case 1: return 200;
        case 2: return 180;
        case 3: return 140;
        case 4: return 120;
        case 5: return 100;
        case 6: return 60;
        case 7: return 40;
        case 8: return 20;
        default: return 0;
    }
}