import axios from "axios";
import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { googleEmail, googleKey } from "../config/config";
import guildsConfig from "../config/guildConfig.json";

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
function getJsDateFromSerialNumber(serialNumber: number): Date {
    return new Date((serialNumber - (25567 + 2))*86400*1000);
}


/**
 * Gets the Serial Number representation of the Date object.
 * @param date The Date object to get the Serial Number representation of.
 * @returns A Serial Number representing the time of the Date object.
 */
function getSerialNumberFromJsDate(date: Date): number {
    return (25567.0 + 2) + date.getTime() / (86400*1000);
}


interface Run {
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

interface SheetOptions {
    patch: string,
    season: string
}

/**
 * Gets all submits for the provided options.
 * @param guildId Id of guild which the submits belong to.
 * @param options Identifiers for the submits.
 * @returns The promisified runs on the sheet.
 */
async function getAllSubmits(guildId: string, options: SheetOptions): Promise<Run[]> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildConfig = (guildsConfig as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildConfig?.sheets);
    if (!sheetId)
        throw 'No sheet belonging to options found.';

    const returnRuns: Run[] = [];
    const rawRuns = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheetId,
        range: guildConfig.sheets.runs,
        majorDimension: 'ROWS',
        valueRenderOption: 'UNFORMATTED_VALUE',
    })).data.values;

    if (!rawRuns)
        throw 'No runs found';

    returnRuns.push(...rawRuns.map(row => { return { date: getJsDateFromSerialNumber(row[0]), 
                                                     username: row[1], 
                                                     time: row[2], 
                                                     proof: row[3], 
                                                     patch: options.patch,
                                                     season: options.season,
                                                     category: row[4],
                                                     map: row[5],
                                                     submitId: row[6] }; 
    }));
    return returnRuns;
}


/**
 * Deletes the submit belonging to the submitId at the specified sheet.
 * @param guildId The id of the guild to get the sheet of.
 * @param sheetOptions The options the describe the sheet.
 * @param submitId The id of the submit.
 */
async function deleteSubmit(guildId: string, sheetOptions: SheetOptions, submitId: number): Promise<void> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildConfig = (guildsConfig as any)[guildId],
          sheetId: string | undefined = Object.values(sheetOptions).reduce((prev, curr) => prev?.[curr], guildConfig?.sheets);
    if (!sheetId) throw 'No sheet belonging to options found.';

    const submits = await getAllSubmits(guildId, sheetOptions);
    const row = submits.findIndex(elem => elem.submitId == submitId) + 2;

    await client.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        auth: token,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: parseInt(guildConfig.sheets.sheetID),
                        dimension: 'ROWS',
                        startIndex: row,
                        endIndex: row + 1
                    }
                }
            }]
        }
    });
}


async function submitNameChange(guildId: string, sheetOptions: SheetOptions, oldName: string, newName: string): Promise<void> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildConfig = (guildsConfig as any)[guildId],
          sheetId: string | undefined = Object.values(sheetOptions).reduce((prev, curr) => prev?.[curr], guildConfig?.sheets);
    if (!sheetId) throw 'No sheet belonging to options found.';

    const submits = await getAllSubmits(guildId, sheetOptions);
    const updatedSubmits = submits.map(submit => {
        return [null, submit.username === oldName ? newName : submit.username]
    });

    await client.spreadsheets.values.update({
        spreadsheetId: sheetId,
        auth: token,
        valueInputOption: 'RAW',
        range: guildConfig.sheets.runs,
        requestBody: {
            majorDimension: 'ROWS',
            values: updatedSubmits
        }
    });
}


interface SubmitOptions {
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
async function submit(guildId: string, submit: SubmitOptions): Promise<void> {
    const guildFormsConfig = (guildsConfig as any)[guildId]?.forms;
    if (!guildFormsConfig)
        throw 'No submit form found';
    
    let submitURL = guildFormsConfig[submit.season];
    submitURL += `&entry.${guildFormsConfig.user}=${encodeURIComponent(submit.user)}`
    submitURL += `&entry.${guildFormsConfig.category}=${encodeURIComponent(submit.category)}`
    submitURL += `&entry.${guildFormsConfig.map}=${encodeURIComponent(submit.map)}`
    submitURL += `&entry.${guildFormsConfig.time}=${encodeURIComponent(submit.time.toFixed(2))}`
    submitURL += `&entry.${guildFormsConfig.proof}=${encodeURIComponent(submit.proof)}`

    const res = await axios.get(submitURL);
    if (res.status !== 200)
        throw 'Submit failed';
}


export { Run, SheetOptions };
export { getJsDateFromSerialNumber, getSerialNumberFromJsDate, getAllSubmits, deleteSubmit, submit, submitNameChange };