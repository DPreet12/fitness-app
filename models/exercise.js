const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema( {
    type: {type: String, required: true},
    duration: Number,
    distance: Number,
    sets: Number,
    reps: Number,
    notes: String,
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food"}]
}, { 
    timestamps: true});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;