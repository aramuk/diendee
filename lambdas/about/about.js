const { genBasicEmbed } = require('../../utils/diendee');
const auth = require('../../auth.json');

/**
 * Prints some information about Diendee
 * @param {Discord.Client} - Diendee Client reference
 * @param {Discord.Message} message - The message that triggered this lambda
 */
const about = (client, message) => {
    var owner = client.users.get(auth.owner);
    let embed = genBasicEmbed(
        client,
        'Greetings adventurer!\nMy name is Diendee and I will aid you on your journey.\n\nType `' +
            auth.prefix +
            'usage` to learn how to talk to me!'
    ).setFooter(`This bot was created by ${owner.username}`, owner.displayAvatarURL);

    message.channel.send(embed);
};

module.exports = about;
