const mapping = require('../../data/mapping');
const { genBioCard }= require('../../utils/characters');

/**
 * Displays a bio card for all requested characters
 * @param {Discord.Client} client - Diendee Client reference
 * @param {Discord.Message} message - The message which requested a bio
 * @param {Array} args - An array of requested characters
 */
module.exports = (client, message, args) => {
    // Get user's character by default if none were provided
    const characters = args.length > 0 ? args : [mapping['u' + message.author.id]];

    Promise.all(characters.map(character => genBioCard(client, character))).then(cards => {
        cards.forEach(card => {
            message.channel.send(card);
        });
    });
};
