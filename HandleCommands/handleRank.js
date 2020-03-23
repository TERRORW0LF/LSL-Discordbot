const { getPbCache } = require('../Util/pbCache');
const getSeasonOptions = require('../Options/seasonOptions');
const getModeOptions = require('../Options/modeOptions');
const getMapOptions = require('../Options/mapOptions');
const { getGoogleAuth } = require('../google-auth');
const { google } = require('googleapis');

module.exports = handleRank;

let isRanking = false;

async function handleRank(message) {
    if (isRanking) return;
    isRanking = true;

    await message.react('💬');
    const botMsg = await message.channel.send('💬 Searching map data, please hold on.');

    try {
        const messageVals = message.content.replace(/!rank /i, '').split(',').map(i => i.trim());
        if (messageVals.length < 1 || messageVals.length > 3) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            botMsg.edit('❌ To many or no enough Parameters! Type \'!help rank\' for an overview of the required parameters.');
            isRanking = false;
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
            isRanking = false;
            return;
        }
		var sheetId;
		if (season === 'season1') sheetId = process.env.gSheetS1;
		else if (season === 'season2') sheetId = process.env.gSheetS2;
		else if (season === 'season3') sheetId = process.env.gSheetS3;
        if (messageVals.length === 1) {
        	const token  = await getGoogleAuth();
			const sheets = await google.sheets('v4');
			const response = (await sheets.spreadsheets.values.get({
            	auth: token,
            	spreadsheetId: sheetId,
            	range: 'Points Sheet!G3:H'
        	})).data;
			const rows = await response.values;
			var found = false;
			for (i=0; i<rows.length; i++) {
				const row = rows[i];
				if (row[1] === message.author.tag) {
					found = true;
					const rank = i+1;
					const points = row[0];
					(await message.reactions).forEach(async(key, value, map) => {
            			if (!key.me) return;
            			await key.remove();
        			});
					message.react('✅');
					botMsg.edit('✅ Rank found!');
					message.channel.send('', {
            			embed: {
                			title: `Combined rank for ${message.author.username}`,
                			url: `https://github.com/TERRORW0LF/LSL-Discordbot`,
                			color: 3010349,
                			author: {
                    			name: 'LSL-discordbot',
                    			icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    			url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                			},
							fields: [{
								name: 'season',
								value: `${season.replace('season', 'season ')}`,
								inline: true
							},
							{
								name: 'mode',
								value: 'combined',
								inline: true
							},
				   		    {
								name: 'user',
								value: `${message.author.username}`,
								inline: true
							},
							{
								name: 'points',
								value: `${points}`,
								inline: true
							},
							{
								name: 'rank',
								value: `${rank}`,
								inline: true
							}],
							timestamp: new Date(),
                			footer: {
                    			icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    			text: 'Rank requested',
                			},
						}
					});
					break;
				}
			}
			if (!found) {
				(await message.reactions).forEach(async(key, value, map) => {
                	if (!key.me) return;
                	await key.remove();
            	});
            	message.react('❌');
				botMsg.edit(`❌ No combined rank found for ${season}`);
			}
			isRanking = false;
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
            isRanking = false;
            return;
        }
		if (messageVals.length === 2) {
			var range;
			mode === 'Standard' ? range = 'A3:B' : range = 'D3:E';
        	const token  = await getGoogleAuth();
			const sheets = await google.sheets('v4');
			const response = (await sheets.spreadsheets.values.get({
            	auth: token,
            	spreadsheetId: process.env.gSheetS3,
            	range: `Points Sheet!${range}`
        	})).data;
			const rows = await response.values;
			var found = false;
			for (i=0; i<rows.length; i++) {
				const row = rows[i];
				if (row[1] === message.author.tag) {
					found = true;
					const rank = i+1;
					const points = row[0];
					(await message.reactions).forEach(async(key, value, map) => {
            			if (!key.me) return;
            			await key.remove();
        			});
					message.react('✅');
					botMsg.edit('✅ Rank found!');
					message.channel.send('', {
            			embed: {
                			title: `${mode} rank for ${message.author.username}`,
                			url: `https://github.com/TERRORW0LF/LSL-Discordbot`,
                			color: 3010349,
                			author: {
                    			name: 'LSL-discordbot',
                    			icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    			url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                			},
							fields: [{
								name: 'season',
								value: `${season.replace('season', 'season ')}`,
								inline: true
							},
							{
								name: 'mode',
								value: `${mode}`,
								inline: true
							},
				   		    {
								name: 'user',
								value: `${message.author.username}`,
								inline: true
							},
							{
								name: 'points',
								value: `${points}`,
								inline: true
							},
							{
								name: 'rank',
								value: `${rank}`,
								inline: true
							}],
							timestamp: new Date(),
                			footer: {
                    			icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    			text: 'Rank requested',
                			},
						}
					});
					break;
				}
			}
			if (!found) {
				(await message.reactions).forEach(async(key, value, map) => {
               		if (!key.me) return;
               		await key.remove();
            	});
           		message.react('❌');
				botMsg.edit(`❌ No ${mode} rank found for ${season}`);
			}
			isRanking = false;
			return;
        }
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
            isRanking = false;
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
                    botMsg.edit('⌛ Timeout while selecting map! No Rank requested.');
                    isRanking = false;
                    return;
                }
            }
        }
        const pbCache = await getPbCache();
        if (!pbCache[season][mode][map] || !pbCache[season][mode][map][message.author.tag]) {
            (await message.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            message.react('❌');
            (await botMsg.reactions).forEach(async(key, value, map) => {
                if (!key.me) return;
                await key.remove();
            });
            botMsg.edit(`❌ No run found for '${season} ${mode} ${map}'. Go and set a time!`);
            isRanking = false;
            return;
        }
        const time = pbCache[season][mode][map][message.author.tag].time;
        var timeArray = [];
        for (user in pbCache[season][mode][map]) {
            timeArray.push(pbCache[season][mode][map][user].time);
        }
        timeArray.sort((a, b) => {
            return Math.round(Number(a)*100) - Math.round(Number(b)*100);
        });
        const rank = timeArray.indexOf(time) + 1;
        (await message.reactions).forEach(async(key, value, map) => {
            if (!key.me) return;
            await key.remove();
        });
        message.react('✅');
        (await botMsg.reactions).forEach(async(key, value, map) => {
            if (!key.me) return;
            await key.remove();
        });
        botMsg.edit('✅ Rank found!');
        message.channel.send('', {
            embed: {
                title: `Map rank for ${message.author.username}`,
                url: `https://github.com/TERRORW0LF/LSL-Discordbot`,
                color: 3010349,
                author: {
                    name: 'LSL-discordbot',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                },
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${map.split(' ').join('%20')}.jpg`,
                },
                fields: [{
                    name: 'season',
                    value: `${season.replace('season', 'season ')}`,
                    inline: true,
                },
                {
                    name: 'mode',
                    value: `${mode}`,
                    inline: true,
                },
                {
                    name: 'map',
                    value: `${map}`,
                    inline: true,
                },
                {
                    name: 'user',
                    value: `${message.author.username}`,
                    inline: true,
                },
                {
                    name: 'time',
                    value: `${time}`,
                    inline: true,
                },
                {
                    name: 'rank',
                    value: `${rank}`,
                    inline: true,
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                    text: 'Rank requested',
                },
            }
        });
        isRanking = false;
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
        botMsg.edit('❌ An error occured while handling your command. Informing staff.');
        console.log('Error in handleRank: '+err.message);
        console.log(err.stack);
        isRanking = false;
    }
}
