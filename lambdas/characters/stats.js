const mapping = require('../../data/mapping');
const { genStatCard } = require('../../utils/characters');

/**
 * Displays a stat card for all requested characters
 * @param {Discord.Client} client - Diendee Client reference
 * @param {Discord.Message} message - The message which requested the stats
 * @param {Array} args - An array of requested characters
 */
const stats = (client, message, args) => {
    // Get user's character by default if none were provided
    const characters = args.length > 0 ? args : [mapping['u' + message.author.id]];

    Promise.all(characters.map(character => genStatCard(client, character))).then(cards => {
        cards.forEach(card => {
            message.channel.send(card);
        });
    });
};

module.exports = stats;