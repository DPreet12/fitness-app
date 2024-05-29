const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema( {
   
    meal1: String,
    meal2: String,
    meal3: String,
    meal4: String,
    notes: String,
    
}, { 
    timestamps: true});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;