const express = require("express");
const router = express.Router();
const passport = require("../config/passport-config");
const isLoggedIn = require("../middleware/isLoggedIn");

const { User, Log, Exercise, Food} = require("../models");


router.get("/logs", isLoggedIn, (req, res) => {
    res.render("app/logs",{})
})

router.get("/allWorkout", isLoggedIn, async (req, res)=> {

    try {
        const currentUser = await User.findById(req.user._id).populate("logs")
        // console.log("current user",req.user)
        //const allWorkout = await Log.find({ user: req.user._id});
        //console.log("allworkout",allWorkout)
        const allWorkout = currentUser.logs;
        res.render("app/allWorkout", {allWorkout: allWorkout})
    } catch (error) {
        req.flash("error", "no worlout available")
        res.redirect("/app/logs")
    }
    
})

router.get("/allWorkout/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const eachLog = await Log.findById(req.params.id);
        res.render("app/editWorkout", { eachLog: eachLog });
    } catch (error) {
        console.log("----ERROR TO GET LOG----", error);
    }
});

router.get("/allWorkout/:id/delete", isLoggedIn, async(req, res)=> {
    try {
        const logId = req.params.id;
        const delLog = await Log.findById(logId);
        res.render("app/deleteWorkout.ejs", {delLog: delLog})
    } catch (error) {
        console.log("----ERROR TO DELETE LOG----",error)
    }
})


router.post("/logs", async (req, res) => {
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
   
    //  console.log(newLog)
     res.redirect("/app/allWorkout")
   
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

  

   
   router.put("/allWorkout/:id", isLoggedIn, async (req, res) => {
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

router.delete("/allWorkout/:id", isLoggedIn, async(req,res) => {
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

module.exports = router;