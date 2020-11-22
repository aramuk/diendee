const logger = require('../utils/logger');

module.exports = (message, prefix, db) => {
  if (message.author.bot || message.content.substring(0, 1) !== prefix) {
    return;
  }
};
