const mongoose = require('mongoose');

const skillSchema = require('./skillSchema');

const statSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    validate: value => Number.isInteger(value),
  },
  saves: {
    type: Boolean,
    default: false,
  },
  skills: {
    type: Map,
    of: skillSchema,
  },
});

statSchema.virtual('modifier').get(() => {
  return Math.floor((this.score - 10) / 2);
});

module.exports = statSchema
