const dropList = [
    'https://tenor.com/view/bomb-war-explode-nuclear-usa-gif-12917129',
    'https://tenor.com/view/b52-bombs-missiles-gif-12763795',
    'https://tenor.com/view/vasu-gif-5203484',
    'https://tenor.com/view/destory-eexplode-nuke-gif-6073338',
    'https://tenor.com/view/nuke-nuclear-bomb-mushroom-clouds-explosion-boom-gif-16362236',
    'https://tenor.com/view/nuke-explode-explosion-nuke-it-from-orbit-gif-16721075'
];

module.exports = run;

async function run(msg, client, regexGroups) {
    try {
        msg.channel.send(dropList[Math.floor(Math.random * dropList.length)]);
    } catch (err) {
        msg.channel.send(createEmbed('An error occurred while handling your command. Informing staff.', 'Error', msg.guild.id));
        console.log('An error occured in drops: '+err.message);
        console.log(err.stack);
    }
}