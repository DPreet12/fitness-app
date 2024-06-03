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

app.get("/", (req, res) => {
    res.render("home", {});
})

app.get("/search", isLoggedIn, (req, res)=> {
    res.render("search", {})
});

app.get("/workout", isLoggedIn, (req, res)=> {
    const API_KEY = process.env.YOUTUBE_KEY
    console.log("key", API_KEY)
    const query = req.query.workout

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
            console.log("video", video);
            const videoObj = {
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnailUrl: video.snippet.thumbnails.medium.url,
                videoId: video.id.videoId,
                publishTime:video.snippet.publishTime,
                channeltitle: video.snippet.channelTitle
            }
            videoArray.push(videoObj)
            console.log("videoArray", videoArray);
        }
        res.render("workout", {videoArray:videoArray})
    })
    .catch(error => {
        console.log("error", error)
    })
})

app.get("/nutrients", (req, res)=> {
    const API_KEY_NEW = process.env.NUTRITION_KEY;
    console.log("key for nutrition", API_KEY_NEW);
    const ID = process.env.APP_ID;
    const query = req.query.nutrients;

    if(cache.has(query)) {
        console.log("form cache");
        const foodObj = cache.get(query);
        return res.render("nutrients", {food: foodObj})
    }

    axios( {
        method: "POST",
        url: "https://trackapi.nutritionix.com/v2/natural/nutrients",
        header: {
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
        res.render("nutrients", {food: foodObj})
    })
    .catch(error => {
        console.log("Error", error)
    });
});
// im port auth routes
 app.use("/auth", require("./controllers/auth"));
// app.use("/pokemon", isLoggedIn, require("./controllers/pokemon"))

//--Authenticated route----go to user profille page--
app.get("/profile", isLoggedIn, (req, res) => {
    newUser = req.user._id
   const { name, email, phone, weight, height, level, goal, gender } = req.user;
   res.render("profile", { name, email, phone, weight, height, level, goal, gender})
});

app.get("/profile/edit/:profileId", isLoggedIn, async(req,res)=> {
    const profile = req.params.profileId;
    console.log("profile Id", profile)

          res.render("editProfile", {profile: profile})


});

app.get("/profile/delete/:delId", isLoggedIn, async(req,res)=> {
    try {
        const delId = req.params.delId;
        console.log("delete id", delId);
        const findId = await User.findById(delId);
        res.render("deleteProfile", {delId: findId})
    } catch (error) {
        console.log("--error while deleting data---", error)
    }
})



app.put("/profile/edit/:profileId", isLoggedIn, async(req, res)=> {

    
    try {
        const profileId = req.params.profileId
        const updateProfile = await User.updateOne({_id: profileId}, {
            
                $set: {
                    name : req.body.name,
                    email : req.body.email,
                     phone: req.body.phone,
                      weight: req.body.weight,
                       height: req.body.height, 
                       level: req.body.level,
                        goal: req.body.goal,
                         gender: req.body.gender
                
            }
        })
        res.redirect("/profile")
        
    } catch (error) {
        console.log("---error editing the profile---", error)
    }
});

app.delete("/profile/deleteProfile/:delId", isLoggedIn, async(req, res)=> {
    try {
        
    const delId = req.params.delId;
    
    if(delId) {
        const delUser = await User.deleteOne({_id: delId});
        console.log("User deleted successfully");

        req.logOut(() => {
            req.session.destroy(() => {
                res.redirect("/auth/logout");
            }) // Logout the user
        })
    } else {
        req.flash("error", "User not found or could not be deleted");
        res.redirect("/profile");
    }

    } catch (error) {
        console.log("--error deleting the user---",error)
        req.flash("error", "Error deleting the user");
        res.redirect("/profile")
    }
})



app.use("/app", require("./controllers/log"));
app.use("/app", require("./controllers/exercise"));
app.use("/app", require("./controllers/food"));


const server = app.listen(PORT, () => {
    console.log("You are listening on PORT", PORT);
})

module.exports = server;