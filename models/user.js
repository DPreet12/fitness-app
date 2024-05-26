const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema( {
    name: { type: String, required: true},
    email : { type: String, required: true, unique: true},
    password : { type: String, required: true},
    phone: {
            type: String,
            validate: {
                validator: function(v) {
                    return /\d{3}-\d{3}-\d{4}/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            },
            required: [true, "Your phone number is required"]
    },
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref:"Log"}]
}, {timestamps: true});

userSchema.pre("save", function(next) {
    console.log("------------PASSWORD---------", this.password); //might delete later...
    let hash = bcrypt.hashSync(this.password, 12);
    console.log("-----HASH----",hash); // might delete later;
    this.password = hash;
    next();
});

//create the model and export it
const User = mongoose.model("User", userSchema);

//make this model available for the index file
module.exports = User;