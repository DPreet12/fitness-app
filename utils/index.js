const bcrypt = require("bcryptjs");

function validPassword(typePassword, userPassword) {
    let isCorrectPasssword = bcrypt.compareSync(typePassword, userPassword);

    return isCorrectPasssword; // true of false
}

module.exports = {
    validPassword
    //any other method needed with go here
}