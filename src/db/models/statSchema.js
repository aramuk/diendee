const mongoose = require('mongoose');

const skillSchema = require('./skill.js');

const statSchema = new mongoose.Schema({
    saves: Boolean,
    skill: {
        type: Map,
        of: skillSchema,
    },
});

module.exports = statSchema;
