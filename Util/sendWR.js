const getUser = require('./getUser');
const serverCfg = require('../Config/serverCfg.json');

module.exports = sendWr;

async function sendWr(guild, oldWr, newWr) {
    try {
        if (!serverCfg[guild.id].channels.wr.enabled) return;
        const userStr = newWr.name.split('#')[0],
              user = await getUser(guild, newWr.name),
              channel = guild.channels.cache.get(serverCfg[guild.id].channels.wr.channel);
        let oldUserStr,
            oldUser,
            dateDif,
            timeSave;
        if (!oldWr) {
            oldWr = {
                name: 'none',
                time: 'none',
                date: 'none',
            }
            oldUserStr = 'none',
            oldUser = 'none',
            dateDif = 'undefined',
            timeSave = 'undefined'
        } else {
            oldUserStr = oldWr.name.split('#')[0];
            oldUser = await getUser(guild, oldWr.name);
            const newYear = newWr.date.split('/')[2].split(' ')[0].trim(),
                  newMonth = Number(newWr.date.split('/')[0])-1,
                  newDay = newWr.date.split('/')[1],
                  newHour = newWr.date.split('/')[2].split(' ')[1].split(':')[0].trim(),
                  newMinute = newWr.date.split('/')[2].split(' ')[1].split(':')[1],
                  newSecond = newWr.date.split('/')[2].split(' ')[1].split(':')[2],
                  newDate = new Date(newYear, newMonth, newDay, newHour, newMinute, newSecond),
                  oldYear = oldWr.date.split('/')[2].split(' ')[0].trim(),
                  oldMonth = Number(oldWr.date.split('/')[0])-1,
                  oldDay = oldWr.date.split('/')[1],
                  oldHour = oldWr.date.split('/')[2].split(' ')[1].split(':')[0].trim(),
                  oldMinute = oldWr.date.split('/')[2].split(' ')[1].split(':')[1],
                  oldSecond = oldWr.date.split('/')[2].split(' ')[1].split(':')[2],
                  oldDate = new Date(oldYear, oldMonth, oldDay, oldHour, oldMinute, oldSecond);
            let msDif = newDate-oldDate,
                yearsDif = Math.floor(msDif/(365*24*60*60*1000));
            msDif -= yearsDif*365*24*60*60*1000;
            const daysDif = Math.floor(msDif/(24*60*60*1000));
            msDif -= daysDif*24*60*60*1000;
            const hoursDif = Math.floor(msDif/(60*60*1000));
            msDif -= hoursDif*60*60*1000;
            const minutesDif = Math.floor(msDif/(60*1000));
            msDif -= minutesDif*60*1000;
            const secondsDif = Math.floor(msDif/(1000));
            dateDif = `${yearsDif} years, ${daysDif} days, ${hoursDif} hours, ${minutesDif} mins, ${secondsDif} secs`,
            timeSave = Math.round(Number(oldWr.time) - Number(newWr.time))
        }
        channel.send(`${user}`, {
            embed: {
                title: `New **World Record** by ${userStr}`,
                url: `${newWr.proof}`,
                color: 3010349,
                thumbnail: {
                    url: `https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/${newWr.stage.split(' ').join('%20')}.jpg`,
                },
                description: `Season: season ${newWr.season}\nMode: ${newWr.category}\nMap: ${newWr.stage}`,
                fields: [
                    {
                        name: '__New Record__',
                        value: `User: ${userStr}\nTime: ${newWr.time}\nDate: ${newWr.date}`,
                        inline: true,
                    },
                    {
                        name: '__Old Record__',
                        value: `User: ${oldUserStr}\nTime: ${oldWr.time}\nDate: ${oldWr.date}`,
                        inline: true,
                    },
                    {
                        name: '__Comparison__',
                        value: `Time save: ${timeSave}\nRecord held: ${dateDif}`,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Record posted',
                    icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                },
            },
        });
        channel.send(`${newWr.name !== oldWr.name && typeof oldUser !== 'string' ? getBM(oldUser) : ''}\n${newWr.proof}`);
    } catch (err) {
        console.log('An error occured in sendWR: '+err.message);
        console.log(err.stack);
    }
}

function getBM(user) {
    const bm = [
        'is not gonna like that!',
        'is all washed up!',
        'is still a pretty good surfer, I guess.',
        'you\'re too slow!',
        'it\'s time for a comeback!',
        'get it back, if you can.',
        'had a good run.',
        'stop sandbagging!'
    ];
    const msg = Math.round(Math.random()*(bm.length-1));
    return `${user} ${bm[msg]}`
}
