const Discord = require('discord.js');

const { TOKEN, PREFIX, OWNER } = require('./auth');
const logger = require('./utils/logger');
const database = require('./db/client');

const onReady = require('./lambdas/onReady');
const onMessage = require('./lambdas/onMessage');

const start = () => {
  let diendeeDB = null;
  try {
    diendeeDB = database.initialize();
  } catch (err) {
    logger.error('Failed to connect to MongoDB instance');
    return process.exit(1);
  }

  const client = new Discord.Client();
  client.on('ready', () => onReady(PREFIX));
  client.on('message', message => onMessage(message, PREFIX, client, diendeeDB));
  client.on('error', error => logger.error(`Discord Client Error: ${error}`));
  client.login(TOKEN);
};

if (typeof require !== undefined && require.main === module) {
  start();
}
