const { formatRolls, rollCharacter } = require('../../utils/roller');
const { genAuthoredEmbed } = require('../../utils/diendee');

/**
 * Rolls a new character (4d6 drop the lowest, 6 times)
 * @param {Discord.Message} message - The message where the roll was requested
 * @param {Discord.Client} - Diendee Client Reference
 */
const rollPC = (message, client) => {
    let embed = genAuthoredEmbed(
        client,
        message.author,
        `${message.author.username} rolled: `,
        '**New Character**:',
        formatRolls(rollCharacter())
    );
    message.channel.send(embed);
};

module.exports = rollPC;
