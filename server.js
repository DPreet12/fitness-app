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
const { default: axios } = require("axios");
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

app.get("/", isLoggedIn, (req, res) => {
    res.render("home", {});
})

// app.get("/search", isLoggedIn, (req, res)=> {
//     res.render("search", {})
// });

const workoutCache = {}

app.get("/workout", isLoggedIn, (req, res)=> {
    const API_KEY = process.env.YOUTUBE_KEY
    console.log("key", API_KEY)
    const query = req.query.workout;

    if(workoutCache[query]) {
        console.log("from workout cache");
        return res.render("workout", {videoArray: workoutCache[query]})
    }

    axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
            key:API_KEY,
            part: "snippet",
            q: query,
            type: "video"
        }
    })
    .then(response => {
        let videoArray = [];
        for(let i = 0; i < response.data.items.length; i++) {
            let video = response.data.items[i];
            // console.log("video", video);
            const videoObj = {
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnailUrl: video.snippet.thumbnails.medium.url,
                videoId: video.id.videoId,
                publishTime:video.snippet.publishTime,
                channeltitle: video.snippet.channelTitle
            }
            videoArray.push(videoObj)
            // console.log("videoArray", videoArray);
        }

        workoutCache[query] = videoArray;


        res.render("workout", {videoArray:videoArray})
    })
    .catch(error => {
        console.log("error", error)
    })
})

const cache = {}
app.get("/nutrients", (req, res)=> {
    const API_KEY_NEW = process.env.NUTRITION_KEY;
    console.log("key for nutrition", API_KEY_NEW);
    const ID = process.env.APP_ID;
    const query = req.query.nutrients;

    if(cache[query]){
        console.log("from cache");
        return res.render("nutrients", {food: cache[query]})
    }

    axios( {
        method: "POST",
        url: "https://trackapi.nutritionix.com/v2/natural/nutrients",
        headers: {
            "Content-Type": "application/json",
            "x-app-id": ID,
            "x-app-key": API_KEY_NEW,
        },
    data: {
        query: query
    }
    })
    .then(response => {
        const foodObj = {
            name: response.data.foods[0].food_name,
            quantity: response.data.foods[0].serving_qty,
            calories: response.data.foods[0].nf_calories,
            carbohydrates: response.data.foods[0].nf_total_carbohydrate,
            potassium: response.data.foods[0].nf_potassium,
            protein: response.data.foods[0].nf_protein,
            image: response.data.foods[0].photo.highres
        }
        cache[query] = foodObj
        console.log("from food");
        res.render("nutrients", {food: foodObj})
    })
    .catch(error => {
        console.log("Error", error)
    });
});


// import auth routes

app.use("/auth", require("./controllers/auth"));
app.use(require("./controllers/profile"));
app.use("/app", require("./controllers/log"));
app.use("/app", require("./controllers/exercise"));
app.use("/app", require("./controllers/food"));


const server = app.listen(PORT, () => {
    console.log("You are listening on PORT", PORT);
})

module.exports = server;