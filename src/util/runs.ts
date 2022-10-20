import { Run } from "./sheets.js";

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
        const pb = pbs.find(run1 => 
            run1.patch === run.patch
            && run1.season === run.season
            && run1.category === run.category
            && run1.map === run.map
            && run1.username === run.username
        );
        if (!pb) {
            pbs.push(run);
            continue;
        }
        if (run.time < pb.time || (run.time === pb.time && run.date.getTime() < pb.date.getTime()))
            pbs[pbs.indexOf(pb)] = run;
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
        const points = getPoints(run, wr);
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
    let place = runs.filter(run1 => run1.time - run.time < -0.0002).length + 1;
    if (place === 1 && run.submitId !== wr.submitId) place = 2;
    return place;
}


/**
 * Gets the points of a run.
 * @param run The run to get the points of.
 * @param wr The wr on the map.
 */
export function getPoints(run: Run, wr: Run) {
    const normalized = (run.time - wr.time) / wr.time;
    const points = Math.floor(100 * Math.log(1 / (normalized + 0.0025)) / 6);
    return points < 0 ? 0 : points;
}