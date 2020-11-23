/**
 * Definition of Diendee's `roll` command.
 */

const { parseNat } = require('../utils/auxlib');
const { genAuthoredEmbed, genBasicEmbed } = require('../utils/diendee');
const logger = require('../utils/logger');
const { formatRolls, rollDice, parseRoll } = require('../utils/roller');

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
    client.user.displayAvatarURL,
    message.author,
    `${message.author.username} rolled: `
  );

  const throws = [];
  for (const roll of args) {
    let start = -1;
    let total = 0;
    let errorFlag = false;
    const rolls = [];
    for (var i = 0; i <= roll.length; i++) {
      if (roll[i] === '+' || roll[i] === '-' || i === roll.length) {
        const sign = start === -1 || roll[start] === '+' ? 1 : -1;
        const cmd = roll.substring(start+1, i);
        logger.info(`roll = ${roll}, roll[${start}:${i}] = ${cmd}, sign = ${roll[start]}(${sign})`);
        let match = parseRoll(cmd);
        if (match) {
          const result = rollDice(parseNat(match[1]), match[2]);
          total += sign * result.total;
          rolls.push(result);
        } else if (!isNaN(cmd)) {
          const num = parseInt(cmd);
          rolls.push({ cmd, result: [num], total: num });
          total += sign * num;
        } else {
          message.channel.send(`I'm not quite sure how to roll ${cmd}`);
          errorFlag = true;
          break;
        }
        start = i;
      }
    }
    if (!errorFlag) {
      throws.push([roll, formatRolls(rolls) + `\n**Total**: ${total}`]);
    }
  }

  for (const [roll, result] of throws) {
    embed.addField(`**${roll}**`, result, true);
  }
  return message.channel.send(embed);
};

/**
 * Creates a usage embed for this command.
 * @param {Client} client Discord client reference.
 * @return {RichEmbed} usage embed;
 */
roll.genUsageEmbed = client => {
  return genBasicEmbed(
    client,
    'The `roll` command:',
    'Description: Rolls stats for a new character.\n\n' +
      'Syntax: `$roll [items ...]`\n\n' +
      'An item is formatted as [M]d[N] or digits, combined by + and -.\n' + 
      'Multiple items can be rolled at once\n\n' +
      'Example: `$roll 2d6+1d8+5 1d20-4 d20`'
  );
};

module.exports = roll;
