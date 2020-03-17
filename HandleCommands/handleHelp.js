module.exports = handleHelp;

async function handleHelp(message) {
    try {
        switch(message.content.toLowerCase().replace('?', '!') {
            case '!help':
                message.channel.send('Help:', {
                    embed: {
                        title: 'Bot overview:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: '!help',
                            value: 'Shows this command.'
                        },
                        {
                            name: '!help [command]',
                            value: 'Gives detailed information about how to use the command.'
                        },
                        {
                            name: '!version',
                            value: 'Returns the bot version.'
                        },
                        {
                            name: '!submit [season], [mode], [map], [time], [link]',
                            value: 'Submit a new run to the leaderboards.'
                        },
                        {
                            name: '!delete [season], [link]',
                            value: 'Delete a posted record.'
                        },
                        {
                            name: '!wr [season], [mode], [map]',
                            value: 'Look up a wordrecord.'
                        },
                        {
                            name: '!pb [season], [mode], [map]',
                            value: 'Look up a personal best.'
                        },
                        {
                            name: '!rank [season], [mode], [map]',
                            value: 'Look up the current rank on a map.'
                        },
                        {
                            name: '!incomplete [season], [mode]',
                            value: 'Look up all completed and incompleted maps.'
                        },
                        {
                            name: 'syntax:',
                            value: 'All parameters ([example]) of a command MUST be sperated by a comma (,).'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                })
                break;
            case '!help submit':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!submit details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!submit [season], [mode], [map], [time], [link]'
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the run as a number. ex: 1'
                        },
                        {
                            name: '[mode]',
                            value: 'The mode of the run. opts: grav / standard'
                        },
                        {
                            name: '[map]',
                            value: 'The map of the run. ex: hanamura'
                        },
                        {
                            name: '[time]',
                            value: 'The achieved time as a 2 point decimal. ex: 11.29'
                        },
                        {
                            name: '[link]',
                            value: 'Full link to the recording of the run.'
                        },
                        {
                            name: 'Example of !submit:',
                            value: '!submit 3, grav, hanamura, 9.50, https://gfycat.com/cloudydishwasherfish'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            case '!help delete':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!delete details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!delete [season], [link]'
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the run as a number. ex: 1',
                        },
                        {
                            name: '[link]',
                            value: 'The link corresponding to the run.'
                        },
                        {
                            name: 'Example of !delete:',
                            value: '!delete 3, https://gfycat.com/cloudydishwasherfish'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                })
                break;
            case '!help wr':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!wr details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Commnad structure:',
                            value: '!wr [season], [mode], [map]'
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the wr as a number. ex: 1'
                        },
                        {
                            name: '[mode]',
                            value: 'The mode of the wr. opts: grav / standard'
                        },
                        {
                            name: '[map]',
                            value: 'The map of the wr. ex: hanamura'
                        },
                        {
                            name: 'Example of !wr:',
                            value: '!wr 3, grav, hanamura'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            case '!help pb':
                message.channel.send('!Command Help:', {
                    embed: {
                        title: '!pb details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!pb [season], [mode], [map]'
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the pb as a number. ex: 1'
                        },
                        {
                            name: '[mode]',
                            value: 'The mode of the pb. opts: grav / standard'
                        },
                        {
                            name: '[map]',
                            value: 'The map of the pb. ex: hanmura'
                        },
                        {
                            name: 'Example of !pb:',
                            value: '!pb 3, grav, hanamura'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            case '!help rank':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!rank details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!rank [season], [mode], [map]'
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the run as a number. ex: 1'
                        },
                        {
                            name: '[mode]',
                            value: 'The mode of the run. opts: grav / standard'
                        },
                        {
                            name: '[map]',
                            value: 'The map of the run. ex: hanamura'
                        },
                        {
                            name: 'Example of !rank:',
                            value: '!rank 3, grav, hanamura'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            case '!help incomplete':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!incomplete details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!incomplete [season], [mode]',
                        },
                        {
                            name: '[season]',
                            value: 'The surf season of the maps as a number. ex: 1'
                        },
                        {
                            name: '[mode]',
                            value: 'The mode of the maps. opts: grav / standard'
                        },
                        {
                            name: 'example of !incomplete:',
                            value: '!incomplete 3, grav'
                        }],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            case '!help version':
                message.channel.send('Command Help:', {
                    embed: {
                        title: '!version details:',
                        url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        color: 3010349,
                        author: {
                            name: 'LSL-discordbot',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                            url: 'https://github.com/TERRORW0LF/LSL-Discordbot',
                        },
                        fields: [{
                            name: 'Command structure:',
                            value: '!version'
                        },
                        {
                            name: 'example of !version:',
                            value: '!version'
                        },],
                        timestamp: new Date(),
                        footer: {
                            text: 'Help posted',
                            icon_url: 'https://raw.githubusercontent.com/TERRORW0LF/LSL-Discordbot/master/Pictures/BotIco.jpg',
                        },
                    }
                });
                break;
            default:
                message.react('❌');
                message.channel.send('❌ Requested help for an unknown command. Use !help for an overview of all existing commands.');
                break;
        }
    } catch(err) {
        message.react('❌');
        message.channel.send('❌ An error occurred while handling your command. Informing staff.');
        console.log('Error in handleHelp: ' + err.message);
        console.log(err.stack);
    }
}
