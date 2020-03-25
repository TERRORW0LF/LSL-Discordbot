const { google } = require('googleapis');
const axios = require('axios');

const getUserReaction = require('../Util/UserReaction');
const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions');
const getMapOptions = require('../Options/mapOptions');

module.exports = handleSubmit;

let isSubmitting = false;

async function handleSubmit(message) { 
    if(isSubmitting) return;
    isSubmitting = true;

    await message.react('💬');
    const botMsg = await message.channel.send('💬 Processing submission. Please hold on.');
    try {
        const messageVals = message.content.replace(/!submit /i, '').split(',').map(i => i.trim());
        if (messageVals.length !== 5) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            botMsg.edit('❌ To many or no enough Parameters! Type \'!help submit\' for an overview of the required parameters.');
            isSubmitting = false;
            return;
        }
        const season = await getSeasonOptions(messageVals[0]);
        if (season === undefined) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            botMsg.edit('❌ No season found for \'' + messageVals[0] + '\'.');
            isSubmitting = false;
            return;
        }
        const mode = await getModeOptions(messageVals[1]);
        if (mode === undefined) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            botMsg.edit('❌ No mode found for \'' + messageVals[1] + '\'.');
            isSubmitting = false;
            return;
        }
        const time = await isTime(messageVals[3]);
        if (Number(time) <= -1) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            if (time === -1) botMsg.edit('❌ Incorrect time format \'' + messageVals[3] + '\'. Time must be split by decimal point (.).');
            else if (time === -2) botMsg.edit('❌Incorrect time format \'' + messageVals[3] + '\'. Time can only have one (1) decimal point (.).');
            else if (time === -3) botMsg.edit('❌Incorrect time format \'' + messageVals[3] + '\'. Time must consist of only numbers (0-9).');
            else if (time === -4) botMsg.edit('❌Incorrect time format \'' + messageVals[3] + '\'. Decimal places must be two (2).');
            isSubmitting = false;
            return;
        }
        const link = messageVals[4];
        const opts = await getMapOptions(messageVals[2]);
        var map;
        if (!opts.length) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            (await botMsg.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            botMsg.edit('❌ No map found for \'' + messageVals[2] + '\'.');
            isSubmitting = false;
            return;
        } else {
            if (opts.length === 1) {
                map = opts[0];
            } else {
                map = await getUserReaction(message, botMsg, opts);
                if (!map) {
                    (await message.reactions).forEach(async(key, value, map) => {
                        if (!key.me) return;
                        await key.remove();
                    });
                    message.react('⌛');
                    (await botMsg.reactions).forEach(async(key, value, map) => {
                        if (!key.me) return;
                        await key.remove();
                    });
                    botMsg.edit('⌛ Timeout while selecting map! No run submitted.');
                    isSubmitting = false;
                    return;
                }
            }
        }
        const submitUrl = await getSubmitUrl(message, season, mode, map, time, link);
        console.log(submitUrl);
        var resp = await axios.post(submitUrl);

        if (resp.status === 200) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('✅');
            (await botMsg.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            botMsg.edit(`✅ New run submitted by ${message.author}`);
        } else {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            (await botMsg.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            botMsg.edit('❌ Not able to submit your run. Please try again.');
        }
        isSubmitting = false;
    } catch (err) {
        (await message.reactions).forEach(async(key, value, map) => {
            if (!key.me) return;
            await key.remove();
        });
        message.react('❌');
        (await botMsg.reactions).forEach(async(key, value, map) => {
            if (!key.me) return;
            await key.remove();
        });
        botMsg.edit('❌ An error occurred while handling your command. Informing staff.');
        console.log('Error in handleSubmission: ' + err.message);
        console.log(err.stack);
        isSubmitting = false;
    }
}

function getSubmitUrl(message, season, mode, map, time, link) {
    var submiturl = '';
    var user = encodeURIComponent(message.author.tag);
    switch (season) {
        case 'season1': 
            submiturl+=`${process.env.gFormS1}`;
            break;
        case 'season2':
            submiturl+=`${process.env.gFormS2}`;
            break;
        case 'season3':
            submiturl+=`${process.env.gFormS3}`;
            break;
    }
    submiturl+=`&entry.${process.env.gFormMODE}=${mode}`;
    submiturl+=`&entry.${process.env.gFormMAP}=${map}`;
    submiturl+=`&entry.${process.env.gFormTIME}=${time}`;
    submiturl+=`&entry.${process.env.gFormLINK}=${link}`;
    submiturl+=`&entry.${process.env.gFormUSER}=${user}`;
    encodeURI(submiturl);
    return submiturl;
}

function isTime(time) {
    var numbers = /^[0-9]+$/;
    var a = time.split('.');
    var length = (time.match(/\./g) || []).length;
    if (length < 1) return -1;
    if (length > 1) return -2;
    if (a[1].length !== 2) return -4;
    if (!a[0].match(numbers) || !a[1].match(numbers)) return -3;
    return time;
}
