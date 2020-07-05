const mongoose = require('mongoose');
const fs = require('fs');

const statSchema = require('./stat.js');

const pcSchema = new mongoose.Schema({
    guild_id: { type: String, required: true },
    player_id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#ffffff' },
    icon: { type: String, required: true, validate: path => fs.existsSync(path) },
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
    combat: {
        type: Number,
    },
});

module.exports = pcSchema;
