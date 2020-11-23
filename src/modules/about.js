/**
 * Definition of Diendee's `about` command.
 */

const { genBasicEmbed } = require('../utils/diendee');
const { OWNER, PREFIX } = require('../auth');

/**
 * Prints some information about Diendee.
 * @param {Discord.Client} client Diendee Client reference.
 * @param {Discord.Message} message The message that triggered this lambda.
 */
const about = (client, message) => {
  var owner = client.users.get(OWNER);
  let embed = genBasicEmbed(
    client,
    'Greetings adventurer!',
    '\nMy name is Diendee and I will aid you on your journey.\n\nType `' +
      PREFIX +
      'usage` to learn how to talk to me!'
  ).setFooter(`This bot was created by ${owner.username}`, owner.displayAvatarURL);

  message.channel.send(embed);
};

/**
 * Creates a usage embed for this command.
 * @param {Client} client Discord client reference.
 * @returns {RichEmbed} usage embed.
 */
about.genUsageEmbed = client => {
  return genBasicEmbed(
    client,
    'The `about` command:',
    'Description: Displays some information about Diendee.\n\nSyntax: `$about`'
  );
};

module.exports = about;
