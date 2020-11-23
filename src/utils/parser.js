/**
 * Functions that parse user input.
 */

/**
 * Identifies the Diendee command and arguments in a message.
 * @param {Message} message Discord Message object.
 * @return {{ cmd: string, args: string[]}}
 */
const parseCommand = (message, prefix) => {
  const args = message.content.slice(prefix).trim().split(/\s+/g);
  const cmd = args.shift().toLowerCase();
  return { cmd, args };
};

module.exports = {
  parseCommand,
};
