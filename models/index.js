const mongoose = require("mongoose");
require("dotenv").config();
console.log("-PRINT--",process.env.MONGO_URI);
// mongoose.connect(process.env.MONGO_URI);


const uri = process.env.MONGO_ATLAS_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);



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