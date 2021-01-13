const Discord = require('discord.js');

const { TOKEN } = require('./auth');
const logger = require('./utils/logger');
const DiendeeDB = require('./db/client');

const onReady = require('./lambdas/onReady');
const onMessage = require('./lambdas/onMessage');

const start = async () => {
  let db = new DiendeeDB();
  try {
    await db.start();
  } catch (err) {
    logger.error('Failed to connect to MongoDB instance');
    return process.exit(1);
  }

  const client = new Discord.Client();
  client.on('ready', () => onReady());
  client.on('message', message => onMessage(client, message, db));
  client.on('error', error => logger.error(`Discord Client Error: ${error}`));
  client.login(TOKEN);
};

if (typeof require !== undefined && require.main === module) {
  start();
}
