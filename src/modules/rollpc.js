/**
 * Definition of Diendee's `rollPC` command.
 */

const { genAuthoredEmbed, genBasicEmbed } = require('../utils/diendee');
const { formatRolls, rollCharacter } = require('../utils/roller');

/**
 * Rolls a new character as 6 rolls of 4d6, dropping the lowest each time.
 * @param {Discord.Client} client Diendee Client reference.
 * @param {Discord.Message} message The message that triggered this lambda.
 */
const rollpc = (client, message) => {
  let embed = genAuthoredEmbed(
    client.user.avatarURL(),
    message.author,
    `${message.author.username} rolled: `
  ).addField('**New Character**:', formatRolls(rollCharacter()));

  return message.channel.send(embed);
};

/**
 * Creates a usage embed for this command.
 * @param {Client} client Discord client reference.
 * @return {MessageEmbed} usage embed;
 */
rollpc.genUsageEmbed = client => {
  return genBasicEmbed(
    client,
    'The `rollpc` command:',
    'Description: Rolls stats for a new character.\n\nSyntax: `$rollpc`'
  );
};

module.exports = rollpc;
