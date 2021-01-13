const mongoose = require('mongoose');

const itemSchema = require('./itemSchema');
const statSchema = require('./statSchema');

const pcSchema = new mongoose.Schema({
  guild_id: { type: String, index: true, required: true },
  player_id: { type: String, index: true, required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#ffffff' },
  icon: { type: String, required: true },
  title: String,
  class: { type: String, required: true },
  subclass: String,
  level: { type: Number, min: 1, max: 20, validate: value => Number.isInteger(value) },
  background: String,
  alignment: {
    type: String,
    required: true,
    enum: [
      'Lawful Good',
      'Neutral Good',
      'Chaotic Good',
      'Lawful Neutral',
      'Neutral Neutral',
      'Chaotic Neutral',
      'Lawful Evil',
      'Neutral Evil',
      'Chaotic Evil',
    ],
  },
  xp: { type: Number, required: true, min: 0 },
  characteristics: {
    Age: String,
    Height: String,
    Weight: String,
    Eyes: String,
    Skin: String,
    Hair: String,
  },
  proficiency_bonus: { type: Number },
  inspiration: false,
  combat: {
    ac: { type: Number, required: true },
    initiative: { type: Number, required: true },
    speed: { type: Number, required: true },
    hp: {
      current: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    hit_dice: {
      current: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    death_saves: {
      successes: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
        validate: value => Number.isInteger(value),
      },
      failures: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
        validate: value => Number.isInteger(value),
      },
    },
  },
  passive_perception: { type: Number, required: true },
  stats: {
    strength: {
      type: statSchema,
      required: true,
    },
    dexterity: {
      type: statSchema,
      required: true,
    },
    constituion: {
      type: statSchema,
      required: true,
    },
    intelligence: {
      type: statSchema,
      required: true,
    },
    wisdom: {
      type: statSchema,
      required: true,
    },
    charisma: {
      type: statSchema,
      required: true,
    },
  },
  inventory: {
    type: Map,
    of: itemSchema,
  },
  bio_preview: '',
});

module.exports = pcSchema;
