/**
 * Defines the schema for a Campaign entity, and compile its model.
 */

 const mongoose = require('mongoose');
 
 const campaignSchema = new mongoose.Schema({
  campaign_id: { type: [String], index: true},
  guild:{ type: [String], index: true},
  dm: String,
  pcs: {
    type: Map,
    of: String,
  },
  npcs: {
    type: Map,
    of:  ,
  },
  archived: [Character],
  active: Boolean,
 });

 module.exports = mongoose.model('Campaign', campaignSchema);