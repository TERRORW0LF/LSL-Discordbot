const axios = require('axios');
const serverCfg = require('../../Config/serverCfg.json');

module.exports = run;

async function run(msg, client, regexGroups) {
    await msg.react('💬');
    const botMsg = await msg.channel.send('💬 Processing submission. Please hold on.');
    try {
        const discordtag = msg.author.tag,
            battletag = regexGroups[3],
            region = getRegion(regexGroups[4]),
            role = msg.guild.roles.cache.find(value => value.name === regexGroups[5]) ? regexGroups[5] : undefined,
            hours = regexGroups[6];
        if (!region || !role) {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Incorrect region or role.');
            return;
        }
        const signinUrl = getSigninUrl(msg.author.tag, battletag, region, role, hours);
        var resp = await axios.post(signinUrl);
        if (resp.status === 200) {
            clearMsg(botMsg, msg);
            msg.react('✅');
            botMsg.edit(`✅ ${msg.author} successfully signed into the tournament.`);
        } else {
            clearMsg(botMsg, msg);
            msg.react('❌');
            botMsg.edit('❌ Failed to sign in.');
        }
    } catch (err) {
        clearMsg(botMsg, msg);
        msg.react('❌');
        botMsg.edit('❌ An error occurred while handling your command.');
        console.log('Error in sign-in: ' + err.message);
        console.log(err.stack);
    }
}

function getRegion(region) {
    if (new RegExp(/na\s*e/i).test(region)) return 'NA East';
    else if (new RegExp(/na\s*w/i).test(region)) return 'NA West';
    else if (new RegExp(/eu/i).test(region)) return 'EU';
    else if (new RegExp(/sa/i).test(region)) return 'SA';
    else if (new RegExp(/asia/i).test(region)) return 'ASIA';
    else if (new RegExp(/oce/i).test(region)) return 'OCE'; 
    else return;
}

function getSigninUrl(discordtag, battletag, region, role, hours) {
    let submiturl = '';
    const user = encodeURIComponent(discordtag),
          submitCfg = serverCfg[msg.guild.id].googleForms.tournament;
    submiturl+= submitCfg.url;
    submiturl+=`&entry.${submitCfg.discordtag}=${user}`;
    submiturl+=`&entry.${submitCfg.battletag}=${battletag}`;
    submiturl+=`&entry.${submitCfg.region}=${region}`;
    submiturl+=`&entry.${submitCfg.role}=${role}`;
    submiturl+=`&entry.${submitCfg.hours}=${hours}`;
    encodeURI(submiturl);
    return submiturl;
}