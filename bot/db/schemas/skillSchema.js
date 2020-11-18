const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    jack_of_all_trades: { type: Boolean, default: false },
    proficiency: { type: Boolean, default: false },
    expertise: { type: Boolean, default: false },
});

module.exports = skillSchema;
