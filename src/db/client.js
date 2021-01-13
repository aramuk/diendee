const mongoose = require('mongoose');

const auth = require('../auth');
const logger = require('../utils/logger');

const campaignSchema = require('./models/campaignSchema');
const itemSchema = require('./models/itemSchema');
const pcSchema = require('./models/pcSchema');
const skillSchema = require('./models/skillSchema');
const statSchema = require('./models/statSchema');

class DiendeeDB {
  constructor(options = {}) {
    if (process.env.DEPLOYMENT !== 'PRD') {
      require('dotenv').config();
    }
    this.config = {
      url: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/`,
      options: {
        dbName: process.env.MONGODB_DBNAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        ...options,
      },
    };
    this.connection = null;
    this.models = {
      Campaign: null,
      PC: null,
      Skill: null,
      Stat: null,
      Item: null,
    };
  }

  async start() {
    try {
      await mongoose.connect(this.config.url, this.config.options);
      this.connection = mongoose.connection;
      logger.info(
        `Successfully connected to MongoDB instance at ${process.env.MONGODB_HOST}/${process.env.MONGODB_DBNAME}`
      );

      this.models = {
        Campaign: this.connection.model('Campaign', campaignSchema),
        PC: this.connection.model('PC', pcSchema),
        Skill: this.connection.model('Skill', skillSchema),
        Stat: this.connection.model('Stat', statSchema),
        Item: this.connection.model('Item', itemSchema),
      };
    } catch (error) {
      logger.error('[DiendeeDB] Connection Error: ', error);
      if (this.connection) {
        this.connection.close();
      }
      this.connection = null;
    }
  }
}

if (typeof require !== undefined && require.main === module) {
  let db = new DiendeeDB();
  db.start().then(() => {
    db.models.Campaign.find({}, (err, docs) => {
      console.log(`Found ${docs.length} Campaigns`);
    });
  });
}

module.exports = DiendeeDB;
