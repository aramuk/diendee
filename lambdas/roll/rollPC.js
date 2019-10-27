const { formatRolls, rollCharacter } = require('../../utils/roller');
const { genAuthoredEmbed } = require('../../utils/diendee');

/**
 * Rolls a new character (4d6 drop the lowest, 6 times)
 * @param {Discord.Client} - Diendee Client reference
 * @param {Discord.Message} message - The message where the roll was requested
 */
const rollPC = (client, message) => {
    let embed = genAuthoredEmbed(
        client.user.displayAvatarURL,
        message.author,
        `${message.author.username} rolled: `
    ).addField('**New Character**:', formatRolls(rollCharacter()));

    message.channel.send(embed);
};

module.exports = rollPC;
