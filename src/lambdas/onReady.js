const logger = require('../utils/logger');

module.exports = prefix => {
  logger.info('Welcome back traveller!');
  logger.info(`Listening for commands that start with '${prefix}'`);
  logger.info('Shall we begin?');
};
