const logger = require('../utils/logger');

const { PREFIX } = require('../auth');

module.exports = () => {
  logger.info('Welcome back traveller!');
  logger.info(`Listening for commands that start with '${PREFIX}'`);
  logger.info('Shall we begin?');
};
