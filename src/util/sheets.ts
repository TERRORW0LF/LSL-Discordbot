import { JWT } from "google-auth-library";
import { google } from "googleapis";
import { googleEmail, googleKey } from "../config/config";
import guildsConfig from "../config/guildConfig.json";

let token: JWT;
export async function getGoogleAuth(): Promise<JWT> {
    if (token && token.credentials.expiry_date as number - new Date().getMilliseconds() < 10_000)
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

export interface SheetRun {
    date: Date,
    username: string,
    time: number,
    proof: string,
    patch: string,
    season: string,
    category: string,
    map: string
}

export interface sheetOptions {
    patch: string,
    season: string
}

/**
 * Gets all submits for options sorted by submit date (oldest -> newest).
 * @param guildId Id of guild which the submits belong to.
 * @param options Identifiers for the submits.
 */
async function getAllSubmits(guildId: string, options: sheetOptions): Promise<SheetRun[]> {
    const client = google.sheets('v4'),
          token = await getGoogleAuth(),
          guildConfig = (guildsConfig as any)[guildId],
          sheetId: string | undefined = Object.values(options).reduce((prev, curr) => prev?.[curr], guildConfig?.sheets);
    if (!sheetId) throw 'No sheet belonging to options found.';

    const rawRuns = (await client.spreadsheets.values.get({
        auth: token,
        spreadsheetId: sheetId,
        range: guildConfig.sheets.runs,
        majorDimension: 'ROWS'
    })).data.values;

    
}