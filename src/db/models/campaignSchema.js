/**
 * Defines the schema for a Campaign entity, and compile its model.
 */

const mongoose = require('mongoose');

const pcSchema = require('./pcSchema');

const campaignSchema = new mongoose.Schema({
  campaign_id: { type: String, required: true, index: true },
  guild: { type: String, required: true, index: true },
  dm: { type: String, required: true },
  pcs: {
    type: Map,
    of: pcSchema,
  },
  npcs: {
    type: Map,
    of: String,
  },
  archived: [pcSchema],
  active: Boolean,
});

module.exports = campaignSchema;
