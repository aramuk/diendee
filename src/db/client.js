const mongoose = require('mongoose');

const logger = require('../utils/logger');

const initialize = () => {
  if (process.env.DEPLOYMENT !== 'prod') {
    require('dotenv').config();
  }
  mongoose.connect(process.env.MONGODB_HOST, {
    dbName: process.env.MONGODB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('error', error => {
    logger.error('[DiendeeDB] Connection Error: ', error);
  });

  db.once('open', () => {
    logger.info(
      `Successfully connected to MongoDB instance at ${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}`
    );
  });

  return db;
};

module.exports = {
  initialize,
};
