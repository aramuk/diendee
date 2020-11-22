const mongoose = require('mongoose');

const initialize = () => {
  if (process.env.DEPLOYMENT !== 'prod') {
    require('dotenv').config();
  }
  mongoose.connect(process.env.MONGODB_HOST, {
    dbName: process.env.MONGODB_NAME,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, '[MongoDB] Connection Error: '));
  db.once('open', () => {
    console.log('Successfully connected to MongoDB instance at', process.env.MONGODB_HOST);
    const 
  });
  return db;
};

export default initialize;
