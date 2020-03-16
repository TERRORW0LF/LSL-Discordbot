const { google } = require('googleapis');
const key = require('./creds.json');

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
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    return;
}
