import axios from "axios";
import { Collection } from "discord.js";
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { googleEmail, googleKey } from "../config/config.js";
import guildsCfg from '../config/guildConfig.json' assert { type: 'json' };

let token: JWT;

/**
 * Gets a JWT to use in the auth property of sheets api requests.
 * @returns A Promisified JSON Web Token which can be used to authenticate yourself on sheet access.
 */
export async function getGoogleAuth(): Promise<JWT> {
    if (token && token.credentials.expiry_date as number - new Date().getMilliseconds() > 30_000)
        return token;

    token = new JWT(
        googleEmail,
        undefined,
        googleKey,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    await token.authorize();
    return token;
}


/**
 * Gets a Date from a google sheets Serial Number date representation.
 * @param serialNumber The Serial Number date representation.
 * @returns A Date object with the same time as the Serial Number.
 */
export function getJsDateFromSerialNumber(serialNumber: number): Date {
    return new Date((serialNumber - (25567 + 2))*86400*1000);
}


/**
 * Gets the Serial Number representation of the Date object.
 * @param date The Date object to get the Serial Number representation of.
 * @returns A Serial Number representing the time of the Date object.
 */
export function getSerialNumberFromJsDate(date: Date): number {
    return (25567.0 + 2) + date.getTime() / (86400*1000);
}


export interface Run {
    submitId: number,
    date: Date,
    username: string,
    time: number,
    proof: string,
    patch: string,
    season: string,
    category: string,
    map: string
}

export interface SheetOptions {
    patch: string,
    season: string
}

/**
 * Gets all submits for the provided options.
 * @param guildId Id of guild which the submits belong to.
 * @param options Identifiers for the submits.
 * @returns The promisified runs on the sheet.
 */
export async function getAllSubmits(guildId: string, options: SheetOptions): Promise<Run[]> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildCfg = (guildsCfg as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildCfg?.sheets);
    if (!sheetId)
        return [];

    const returnRuns: Run[] = [];
    const rawRuns = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheetId,
        range: guildCfg.sheets.runs,
        majorDimension: 'ROWS',
        valueRenderOption: 'UNFORMATTED_VALUE',
    })).data.values;

    if (!rawRuns)
        return [];

    returnRuns.push(...rawRuns.map(row => { 
        return { 
            date: getJsDateFromSerialNumber(row[0]), 
            username: row[1], 
            time: row[2], 
            proof: row[3], 
            patch: options.patch,
            season: options.season,
            category: row[5],
            map: row[4],
            submitId: row[6] 
        };
    }));
    return returnRuns;
}


/**
 * Deletes the submit belonging to the submitId at the specified sheet.
 * @param guildId The id of the guild to get the sheet of.
 * @param options The options the describe the sheet.
 * @param submitId The id of the submit.
 */
export async function deleteSubmit(guildId: string, submitId: number, options: SheetOptions): Promise<void> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildCfg = (guildsCfg as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildCfg?.sheets);
    if (!sheetId) throw 'Sheet id not found';

    const submits = await getAllSubmits(guildId, options);
    const row = submits.findIndex(elem => elem.submitId == submitId) + 1;

    await client.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        auth: token,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: parseInt(guildCfg.sheets.sheetID),
                        dimension: 'ROWS',
                        startIndex: row,
                        endIndex: row + 1
                    }
                }
            }]
        }
    });
}


/**
 * Updates the submit belonging to the submitId with a new link to the video proof.
 * @param guildId The id of the guild to get the sheets of.
 * @param submitId The id of the submit.
 * @param link The new link to the run.
 * @param options The options that descripe the sheet.
 */
export async function editSubmit(guildId: string, submitId: number, link: string, options: SheetOptions): Promise<void> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildCfg = (guildsCfg as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildCfg?.sheets);
    if (!sheetId) throw 'Sheet id not found';

    const submits = await getAllSubmits(guildId, options);
    const row = submits.findIndex(elem => elem.submitId == submitId) + 2;

    await client.spreadsheets.values.update({
        spreadsheetId: sheetId,
        auth: token,
        valueInputOption: 'RAW',
        range: `Record Log!D${row}`,
        requestBody: {
            majorDimension: 'ROWS',
            values: [[link]]
        }
    });
}


export interface Points {
    Standard: number,
    Gravspeed: number,
    Total: number
}

/**
 * Gets the users with their points from the given sheets.
 * @param guildId The guild which the sheet belongs to.
 * @param options The options for the sheet to fetch.
 * @returns A Promisified Collection with the username as the key and the points as the value.
 */
export async function getMembersWithPoints(guildId: string, options: SheetOptions): Promise<Collection<string, Points>> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildCfg = (guildsCfg as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildCfg?.sheets);
    if (!sheetId) return new Collection();

    const userPoints = (await client.spreadsheets.values.batchGet({
        auth: token,
        spreadsheetId: sheetId,
        majorDimension: 'ROWS',
        valueRenderOption: 'UNFORMATTED_VALUE',
        ranges: [guildCfg.sheets.points.Standard, guildCfg.sheets.points.Gravspeed, guildCfg.sheets.points.total]
    })).data.valueRanges;
    if (!userPoints) return new Collection();

    const points = new Collection<string, Points>();
    if (userPoints[2].values)
        for (const row of userPoints[2].values)
            points.set(row[1], { Total: row[0], Standard: 0, Gravspeed: 0});
    if (userPoints[0].values)
        for (const row of userPoints[0].values) {
            const oldPoints = points.get(row[1]) as Points;
            points.set(row[1], { Total: oldPoints.Total, Standard: row[0], Gravspeed: oldPoints.Gravspeed });
        }
    if (userPoints[1].values)
        for (const row of userPoints[1].values) {
            const oldPoints = points.get(row[1]) as Points;
            points.set(row[1], { Total: oldPoints.Total, Standard: oldPoints.Standard, Gravspeed: row[0] });
    }
    return points;
}


/**
 * Updates the name of a user on the sheets from the old name to the new name.
 * @param guildId The guild whch the sheet belongs to.
 * @param sheetOptions The options for the sheet to get.
 * @param oldName The old name.
 * @param newName The new name.
 */
export async function submitNameChange(guildId: string, oldName: string, newName: string, sheetOptions: SheetOptions): Promise<void> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildCfg = (guildsCfg as any)[guildId],
          sheetId: string | undefined = Object.values(sheetOptions).reduce((prev, curr) => prev?.[curr], guildCfg?.sheets);
    if (!sheetId) throw 'No sheet belonging to options found.';

    const submits = await getAllSubmits(guildId, sheetOptions);
    const updatedSubmits = submits.map(submit => {
        return [null, submit.username === oldName ? newName : submit.username]
    });

    await client.spreadsheets.values.update({
        spreadsheetId: sheetId,
        auth: token,
        valueInputOption: 'RAW',
        range: guildCfg.sheets.runs,
        requestBody: {
            majorDimension: 'ROWS',
            values: updatedSubmits
        }
    });
}


export interface SubmitOptions {
    user: string,
    season: string,
    category: string,
    map: string,
    time: number,
    proof: string
}

/**
 * Submits a given submit to the sheets by making a forms submit.
 * @param guildId The id of the guild the submit came from.
 * @param submit The submit object.
 */
export async function submit(guildId: string, submit: SubmitOptions): Promise<void> {
    const guildFormsConfig = (guildsCfg as any)[guildId]?.forms;
    if (!guildFormsConfig)
        throw 'No submit form found';
    
    let submitURL = guildFormsConfig[submit.season];
    submitURL += `&entry.${guildFormsConfig.user}=${encodeURIComponent(submit.user)}`
    submitURL += `&entry.${guildFormsConfig.category}=${encodeURIComponent(submit.category)}`
    submitURL += `&entry.${guildFormsConfig.map}=${encodeURIComponent(submit.map)}`
    submitURL += `&entry.${guildFormsConfig.time}=${encodeURIComponent(submit.time.toFixed(3))}`
    submitURL += `&entry.${guildFormsConfig.proof}=${encodeURIComponent(submit.proof)}`

    const res = await axios.get(submitURL);
    if (res.status !== 200)
        throw 'Submit failed';
}