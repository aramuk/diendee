/**
 * Definition of Diendee's `about` command.
 */

const { genBasicEmbed } = require('../utils/diendee');
const { OWNER, PREFIX } = require('../auth');
const logger = require('../utils/logger');

/**
 * Prints some information about Diendee.
 * @param {Discord.Client} client Diendee Client reference.
 * @param {Discord.Message} message The message that triggered this lambda.
 */
const about = async (client, message) => {
  try {
    const owner = await client.users.fetch(OWNER);
    let embed = genBasicEmbed(
      client,
      'Greetings adventurer!',
      '\nMy name is Diendee and I will aid you on your journey.\n\nType `' +
        PREFIX +
        'usage` to learn how to talk to me!'
    ).setFooter(`This bot was created by ${owner.username}`, owner.avatarURL());

    return message.channel.send(embed);
  } catch (err) {
    return message.channel.send('Hmm...there seems to be an issue with my records.');
    logger.error(`[Discord Error]: Could not fetch user ${OWNER}`);
  }
};

/**
 * Creates a usage embed for this command.
 * @param {Client} client Discord client reference.
 * @returns {MessageEmbed} usage embed.
 */
about.genUsageEmbed = client => {
  return genBasicEmbed(
    client,
    'The `about` command:',
    'Description: Displays some information about Diendee.\n\nSyntax: `$about`'
  );
};

module.exports = about;
