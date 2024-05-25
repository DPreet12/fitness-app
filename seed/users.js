const mongoose = require("mongoose");
require("dotenv").config();


//import models



const { User } = require("../models");
console.log(User)

// Create a User
User.create({
    name: "Kevin Jones",
    email: "kevinjones@email.com",
    phone: "888-444-1010",
    password: "poiutrewq"
})
.then( user => {
    console.log("----NEW USER----\n", user);
})
.catch(error => {
    console.log("----ERROR CREATING USER-----\n",error);
})