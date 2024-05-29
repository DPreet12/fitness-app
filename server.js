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
   const { name, email, phone } = req.user;
   res.render("profile", { name,email,phone})
})

//any autehenticated route will need to have isLoggedIn before controller

// app.get("/pokemon", isLoggedIn, (req,res)=> {
    //get data
    //render page + send data to page
// })

//aap.get("/pokemon/:id/edit", isLoggedIn, (req,res)=> {})
//app.delete("/pokeon/:id", isLoggedIn, (req,res)=> {})

app.get("/app/logs", isLoggedIn, (req, res) => {
    res.render("app/logs",{})
})

app.get("/app/allWorkout", isLoggedIn, async (req, res)=> {

    try {
        const currentUser = await User.findById(req.user._id).populate("logs")
        console.log("current user",req.user)
        //const allWorkout = await Log.find({ user: req.user._id});
        //console.log("allworkout",allWorkout)
        const allWorkout = currentUser.logs;
        res.render("app/allWorkout", {allWorkout: allWorkout})
    } catch (error) {
        req.flash("error", "no worlout available")
        res.redirect("/app/logs")
    }
    
})


app.post("/app/logs", async (req, res) => {
    //res.send(req.body)
    try {
       
     const newLog = await Log.create({
      date: req.body.data,
      totalSets: req.body.totalSets,
      repsForEachSet: req.body.repsForEachSet,
      totalDuration: req.body.totalDuration,
      totaldistance: req.body.totaldistance
     })
   
   await User.findByIdAndUpdate(req.user._id, {$push: {logs: newLog}})
   //console.log("---------logs array------",logs)
   
     console.log(newLog)
     res.redirect("/app/logs")
   
    } catch (error) {
       console.log('----- ERROR IN LOGS POST ----', error);
      //res.send(error)
     if(error.name === "ValidationError") {
    req.flash("error", "Please use the appropriate format to fill the workouts");
     return res.redirect("/app/logs")
     }
     req.flash("error", "An unexpected error occurred. Please try again.");
     res.redirect("/app/logs");
    }
   
   })

   app.get("/app/allWorkout/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const eachLog = await Log.findById(req.params.id);
        res.render("app/editWorkout", { eachLog: eachLog });
    } catch (error) {
        console.log("----ERROR TO GET LOG----", error);
    }
});

app.get("/app/allWorkout/:id/delete", isLoggedIn, async(req, res)=> {
    try {
        const logId = req.params.id;
        const delLog = await Log.findById(logId);
        res.render("app/deleteWorkout.ejs", {delLog: delLog})
    } catch (error) {
        console.log("----ERROR TO DELETE LOG----",error)
    }
})
   
app.put("/app/allWorkout/:id", isLoggedIn, async (req, res) => {
    try {
        await Log.updateOne({ _id: req.params.id }, {
            $set: {
                date: req.body.date,
                totalSets: req.body.totalSets,
                repsForEachSet: req.body.repsForEachSet,
                totalDuration: req.body.totalDuration,
                totaldistance: req.body.totaldistance
            }
        });
        res.redirect("/app/allWorkout");
    } catch (error) {
        console.log("---Error during editing---", error);
        req.flash("error", "Error occurred during editing");
        res.redirect("/app/allWorkout");
    }
});

app.delete("/app/allWorkout/:id", isLoggedIn, async(req,res) => {
    try {
        const logId = req.params.id;
        const eachId = await Log.deleteOne({_id: logId});
        req.flash("success", "log deleted successfully")
       res.redirect("/app/allWorkout")
        }
     catch (error) {
        console.log("---Error in deleting log-----", error);
        req.flash("error", "cannot delete the log")
    }
})


// Add exercises route

app.get("/app/exercise/:logId", isLoggedIn, (req,res) => {
    const logId = req.params.logId;
    console.log("see exercise logId", logId)
    res.render("app/exercise", {logId: logId})
})


app.get("/app/showExercises/:logid", isLoggedIn, async(req,res) => {

    try {
        const logId = req.params.logid;
        console.log("see 2nd logId", logId)
        const log = await Log.findById(logId).populate("exercises");
        res.render("app/showExercises", {log2 : log})
    } catch (error) {
        console.log("---Error in getting exercises---", error)
    }
})




app.get("/app/editExercise/:exerciseId/edit", async(req, res)=> {
    try {
        const exerciseId = req.params.exerciseId;
        console.log("see edit logId",exerciseId);
    //   const findId = await Exercise.updateOne({_id: logId}, {
    //     $set: {
    //         type: req.body.type,
    //         duration: req.body.duration,
    //         distance: req.body.distance,
    //         sets: req.body.sets,
    //         reps: req.body.reps,
    //         notes: req.body.notes
    //     }
    //   })

    const findId = await Exercise.findById(exerciseId)

        res.render("app/editExercise", {findId: findId})
    } catch (error) {
        console.log("---error editing the exercise-----")
    }
})

app.get("/app/deleteExercise/:delId/delete", isLoggedIn, async(req,res)=> {
    try {
        
          const delId = req.params.delId
          const delId2 = await Exercise.findById(delId)
       
       res.render("app/deleteExercise", {delId2: delId2})
    } catch (error) {
        console.log("---Error in deleting exercise exercises---", error)
    
    }
})


app.post("/app/exercise/:logId", async (req,res)=> {

    const logId = req.params.logId
   try {
    
    const newExercise  = await Exercise.create({
        type: req.body.type,
        duration: req.body.duration,
        distance: req.body.distance,
        sets: req.body.sets,
        reps: req.body.reps,
        notes: req.body.notes
    })

    await Log.findByIdAndUpdate(logId , {$push: {exercises: newExercise._id}})
    console.log("new exercise", newExercise);
    res.redirect("/app/allWorkout")
   } catch (error) {
    console.log("---Error in posting a exercise---", error);
    req.flash("error", "please use the appropriate format");
    res.redirect("/app/exercise/${logId}")
   }
});


app.put("/app/editExercise/:exerciseId", async(req, res)=> {
    console.log("---updated exercise---", req.body)
    try {
        const exerciseId = req.params.exerciseId;
        const findId = await Exercise.updateOne({ _id: exerciseId}, {
            $set: {
                type: req.body.type,
                duration: req.body.duration,
                distance: req.body.distance,
                sets: req.body.sets,
                reps: req.body.reps,
                notes: req.body.notes
            }
        })
        
        res.redirect("/app/allWorkout")
      //  res.redirect("/app/showExercises")
    } catch (error) {
        console.log("---error to edit exercise-----", error)
    }
})

app.delete("/app/deleteExercise/:delId", isLoggedIn, async(req, res)=> {
 try {
    const delId = req.params.delId
    const findId = await Exercise.deleteOne({_id: delId});
    req.flash("success", "exercise deleted successfully")
       res.redirect("/app/allWorkout")
 } catch (error) {
    console.log("--error in deleting exercise----")
 }
})

app.get("/app/food/:foodId", async(req, res) => {
    
    try {
        const foodId = req.params.foodId;
        res.render("app/food", {foodId: foodId})
    } catch (error) {
        console.log("---error to find foods---",error)
    }
})

app.get("/app/showfood/:foodId", async(req, res)=> {
    try {
        const foodId = req.params.foodId;
        const food = await Exercise.findById(foodId).populate("foods")
        res.render("app/showFood", {food: food})
    } catch (error) {
        console.log("---error shoing the foods--", error)
    }
})

app.get("/app/editfood/:foodId/edit", async(req, res)=> {
    try {
        const foodId = req.params.foodId;

        const specificFoodId = await Food.findById(foodId)
        res.render("app/editFood", {foodIdNew: specificFoodId})
    } catch (error) {
        console.log("---error editing the foods--", error)
    }
})

app.get("/app/deletefood/:foodId/delete", async(req, res)=> {
    try {
        const delFood = req.params.foodId;

        const delFoodId = await Food.findById(delFood);
        console.log(delFoodId)
        res.render("app/deleteFood", {delFoodId2: delFoodId})
    } catch (error) {
        console.log("error deleting the food", error)
    }
})


app.post("/app/food/:foodId", async(req,res) => {
    try {
        const foodId = req.params.foodId;
     
      const newFood = await Food.create({
        meal1 : req.body.meal1,
        meal2: req.body.meal2,
        meal3: req.body.meal3,
        meal4: req.body.meal4,
        notes: req.body.notes
      })

      await Exercise.findByIdAndUpdate(foodId, {$push: {foods: newFood._id}})
      res.redirect("/app/allWorkout")
      console.log("new food", newFood);
    } catch (error) {
        console.log("---error to post foods---",error)
    }
})

app.put("/app/editfood/:foodId", async(req, res) => {
    console.log("---updated food---", req.body)
    try {
        const foodId = req.params.foodId;

        const updateFood = await Food.updateOne({_id: foodId}, {$set : {
            meal1: req.body.meal1,
            meal2: req.body.meal2,
            meal3: req.body.meal3,
            meal4: req.body.meal4,
        }})

        res.redirect("/app/allWorkout")
    } catch (error) {
        console.log("---error to error showing edited foods---",error)
    }
})

app.delete("/app/deletefood/:foodId", async(req, res) => {

try {
    const foodId = req.params.foodId;

    const delId = await Food.deleteOne({_id: foodId});
    res.redirect("/app/allWorkout")
} catch (error) {
    console.log("--error deleting the food-----")
}

})

const server = app.listen(PORT, () => {
    console.log("You are listening on PORT", PORT);
})

module.exports = server;