const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  count: { type: Number, default: 1 },
  weight: { type: Number, default: 0, min: 0 },
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = itemSchema;
