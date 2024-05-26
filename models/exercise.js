const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema( {
    type: {type: String, required: true},
    duration: Number,
    distance: Number,
    sets: Number,
    reps: Number,
    notes: String
}, { 
    timestamps: true});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;