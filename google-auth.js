const { google } = require('googleapis');

module.exports = {
    getGoogleAuth,
    setGoogleAuth
}

let jwtClient;

async function setGoogleAuth() {
    if(!jwtClient) await setClient();
    await jwtClient.authorize();
    return;
}

async function getGoogleAuth() {
    try {
        const needRefresh = !jwtClient || !jwtClient.access_token || jwtClient.expiry_date < new Date();
        if (needRefresh) await setGoogleAuth();
        return jwtClient;
    } 
    catch(error) {
        console.log('An error occurred in getGoogleAuth: ' + error.message);
        console.log(error.stack);
    }
}

async function setClient() {
    jwtClient = new google.auth.JWT(
        process.env.gCredsEMAIL,
        null,
        process.env.gCredsKEY.replace(/\\n/gm, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    return;
}
