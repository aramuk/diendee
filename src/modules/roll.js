/**
 * Definition of Diendee's `roll` command.
 */

const { genAuthoredEmbed, genBasicEmbed } = require('../utils/diendee');
const logger = require('../utils/logger');
const { formatRolls, rollRegex, parseRollExpr } = require('../utils/roller');

/**
 * Rolls the requested dice.
 * @param {Discord.Client} client Diendee Client reference.
 * @param {Discord.Message} message The message that triggered this lambda.
 * @param {string[]} args The dice commands.
 */
const roll = (client, message, args) => {
  if (args.length < 1) {
    return message.channel.send('What would you like me to roll?');
  }

  let embed = genAuthoredEmbed(
    client.user.avatarURL(),
    message.author,
    `${message.author.username} rolled: `
  );

  for (const item of args) {
    if (!rollRegex.exec(item)) {
      message.channel.send(`I'm not quite sure how to roll ${item}.`);
      continue;
    }
    const { grandTotal, rolls } = parseRollExpr(item);
    embed.addField(`**${item}**`, formatRolls(rolls) + `\n**Total**: ${grandTotal}`, true);
  }

  if (embed.fields.length > 0) {
    return message.channel.send(embed);
  }
};

/**
 * Creates a usage embed for this command.
 * @param {Client} client Discord client reference.
 * @return {MessageEmbed} usage embed;
 */
roll.genUsageEmbed = client => {
  return genBasicEmbed(
    client,
    'The `roll` command:',
    'Description: Rolls stats for a new character.\n\n' +
      'Syntax: `$roll item ...`\n\n' +
      'An item is formatted as [N]d[S] or digits, combined by + and -.\n' +
      'If not specified, the number of dice N, will be assumed to be 1.\n\n' +
      'Optionally, only the highest or lowest [D] rolls can be kept, ' +
      'using the notation [N]d[S]kh[D] to keep the D highest, or ' +
      '[N]d[S]kl[D] to keep the D lowest rolls.\n\n' + 
      'Multiple items can be rolled at once.\n\n' +
      'Example: `$roll 4d6 2d10+1d8+5 1d20-4 d20 8d8kh6+3d4kl2`'
  );
};

module.exports = roll;
