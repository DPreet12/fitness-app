require("dotenv").config();
const express = require("express");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
//const passport = require("passport");
const passport = require("./config/passport-config");
const isLoggedIn = require("./middleware/isLoggedIn");
const methodOverride = require("method-override");

const SECRET_SESSION = process.env.SECRET_SESSION;
const PORT = process.env.PORT || 3000;


//import models
const { User, Log, Exercise, Food } = require("./models");
const { updateOne } = require("./models/user");
console.log("Models", {User, Log, Exercise, Food})


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(session({
    secret: SECRET_SESSION,
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

//intialize passport
app.use(passport.initialize());
app.use(passport.session());

// middleware for tracking users and alerts
app.use((req, res, next)=> {
    res.locals.alerts = req.flash();
    res.locals.currentUser = req.user;
    next(); //going to the route
});

app.get("/", (req, res) => {
    res.render("home", {});
})

// im port auth routes
 app.use("/auth", require("./controllers/auth"));
// app.use("/pokemon", isLoggedIn, require("./controllers/pokemon"))

//--Authenticated route----go to user profille page--
app.get("/profile", isLoggedIn, (req, res) => {
    newUser = req.user.id
   const { name, email, phone, weight, height, level, goal, gender } = req.user;
   res.render("profile", { name, email, phone, weight, height, level, goal, gender})
})

app.use("/app", require("./controllers/log"));
app.use("/app", require("./controllers/exercise"));
app.use("/app", require("./controllers/food"));


const server = app.listen(PORT, () => {
    console.log("You are listening on PORT", PORT);
})

module.exports = server;