const mongoose = require("mongoose");

const logSchema = new mongoose.Schema( {
    date: {type: Date, default: Date.now},
    totalSets : Number,
    repsForEachSet: Number,
    totalDuration: Number,
    totaldistance: Number,
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref:"Exercise"}]
}, {
    timestamps: true
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;