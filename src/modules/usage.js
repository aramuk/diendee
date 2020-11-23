/**
 * Definition of Diendee's `usage` command.
 */

const { genBasicEmbed, removePinnedMessages } = require('../utils/diendee');

// Diendee command modules
const about = require('../modules/about');
const roll = require('../modules/roll');
const rollpc = require('../modules/rollpc');

/**
 * Prints documentation for the commands supported by Diendee.
 * @param {Client} Diendee Discord client reference.
 * @param {Message} message The message that triggered this lambda.
 * @param {string[]} args Arguments passed to this message.
 */
const usage = (client, message, args) => {
  const title = 'Talking to Diendee:';

  // In the case that only the basic usage was requested.
  if (args.length < 1 || args[0].toLowerCase() === 'usage') {
    // Remove old usage command
    removePinnedMessages(client, message, title);
    // Send full usage embed and pin.
    return message.channel.send(usage.genUsageEmbed(client, title)).then(msg => msg.pin());
  }

  switch (args[0].toLowerCase()) {
    case 'about':
      return message.channel.send(about.genUsageEmbed(client));
    case 'roll':
      return message.channel.send(roll.genUsageEmbed(client));
    case 'rollpc':
      return message.channel.send(rollpc.genUsageEmbed(client));
    default:
      return message.channel.send(`I didn't quite understand what you meant by ${args[0]}.`);
  }
};

/**
 * Returns an embed with usage summaries for all modules.
 * @param {string} title Title for the usage embed.
 * @return {RichEmbed}
 */
usage.genUsageEmbed = (client, title) => {
  let embed = genBasicEmbed(
    client,
    title,
    "Here's a list of my commands.\nType `$usage [command]` for details."
  )
    .addField('`about`:', 'About me!')
    .addField('`usage`:', 'How to talk to me!')
    .addField('`roll`:', 'Rolling some dice')
    .addField('`rollPC`:', 'Roll a new character.');

  return embed;
};

module.exports = usage;
