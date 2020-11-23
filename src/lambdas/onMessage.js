const logger = require('../utils/logger');

module.exports = (message, prefix, client, db) => {
  if (message.isMemberMentioned(client.user)) {
    switch (Math.floor(Math.random() * 5 + 1)) {
      case 1:
        message.channel.send('Please await my return, friend.');
        break;
      case 2:
        message.channel.send(`${message.author.username}, I shall return shortly.`);
        break;
      case 3:
        message.channel.send(
          `Unfortunately, I am not in the office at the moment, ${message.author.username}.`
        );
        break;
      case 4:
        message.channel.send('I am currently on sabatical.');
        break;
      case 5:
      default:
        message.channel.send(
          `Regrettably, I am unable to handle your request at this moment, ${message.author.username}.`
        );
        break;
    }
    return;
  } else if (message.author.bot || message.content.substring(0, 1) !== prefix) {
    return;
  }
  const args = message.content.slice(prefix).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  switch (cmd) {
    case 'usage':
    case 'about':
    case 'roll':
    default:
      message.channel.send(`I am afraid I didn't understand your request.`);
  }
};
