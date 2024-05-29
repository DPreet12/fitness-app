const mongoose = require("mongoose");
require("dotenv").config();
console.log("-PRINT--",process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);

//import models

const  User  = require("./user");
const Log = require("./logs");
const Exercise = require("./exercise");
const Food = require("./food")

const db = mongoose.connection;

db.once("open", () => console.log(`Connected to MonogoDB at ${db.host}:${db.port}`));
db.on("error", (error) => console.log("Database error \n", error));

module.exports = {
    // models go
    User,
    Log,
    Exercise,
    Food
}