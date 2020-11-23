/**
 * Lambda function that triggers when the client receives a 'message' event.
 */

const { PREFIX } = require('../auth');
const { parseCommand } = require('../utils/parser');

// Diendee command modules
const about = require('../modules/about');
const usage = require('../modules/usage');
const roll = require('../modules/roll');
const rollPC = require('../modules/rollpc');

module.exports = (client, message, db) => {
  if (message.isMemberMentioned(client.user)) {
    switch (Math.floor(Math.random() * 5 + 1)) {
      case 1:
        return message.channel.send('Please await my return, friend.');
      case 2:
        return message.channel.send(`${message.author.username}, I shall return shortly.`);
      case 3:
        return message.channel.send(
          `Unfortunately, I am not in the office at the moment, ${message.author.username}.`
        );
      case 4:
        return message.channel.send('I am currently on sabatical.');
      case 5:
      default:
        return message.channel.send(
          `Regrettably, I am unable to handle your request at this moment, ${message.author.username}.`
        );
    }
  } else if (message.author.bot || message.content.substring(0, 1) !== PREFIX) {
    return;
  }

  const { cmd, args } = parseCommand(message, PREFIX);
  switch (cmd) {
    case '$about':
      return about(client, message);
    case '$usage':
      return usage(client, message, args);
    case '$roll':
      return roll(client, message, args);
    case '$rollpc':
      return rollPC(client, message);
    default:
      return message.channel.send(`I am afraid I didn't understand your request.`);
  }
};
