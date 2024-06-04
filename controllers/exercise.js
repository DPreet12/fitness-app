const express = require("express");
const router = express.Router();
const passport = require("../config/passport-config");
const isLoggedIn = require("../middleware/isLoggedIn");

const { User, Log, Exercise, Food} = require("../models");


// Add exercises route

router.get("/exercise/:logId", isLoggedIn, (req,res) => {
    const logId = req.params.logId;
    console.log("see exercise logId", logId)
    res.render("app/exercise", {logId: logId})
})


router.get("/showExercises/:logid", isLoggedIn, async(req,res) => {

    try {
        const logId = req.params.logid;
        console.log("see 2nd logId", logId)
        const log = await Log.findById(logId).populate("exercises");
        res.render("app/showExercises", {log2 : log})
    } catch (error) {
        console.log("---Error in getting exercises---", error)
    }
})




router.get("/editExercise/:exerciseId/edit", async(req, res)=> {
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

router.get("/deleteExercise/:delId/delete", isLoggedIn, async(req,res)=> {
    try {
        
          const delId = req.params.delId
          const delId2 = await Exercise.findById(delId)
       
       res.render("app/deleteExercise", {delId2: delId2})
    } catch (error) {
        console.log("---Error in deleting exercise exercises---", error)
    
    }
})


router.post("/exercise/:logId", async (req,res)=> {

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
    // console.log("new exercise", newExercise);
    res.redirect("/app/allWorkout")
   } catch (error) {
    console.log("---Error in posting a exercise---", error);
    req.flash("error", "please use the appropriate format");
    // res.redirect("/app/exercise/${logId}")
   }
});


router.put("/editExercise/:exerciseId", async(req, res)=> {
    console.log("---updated exercise---", req.body)
    try {
        const exerciseId = req.params.exerciseId;
        // const logId = req.query.logId;
        // console.log("exerciseId",exerciseId)
        // console.log("logId",logId)
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
        
        // res.redirect(`/app/showExercises/${logId}`)
       res.redirect("/app/allWorkout")
    } catch (error) {
        console.log("---error to edit exercise-----", error)
    }
})

router.delete("/deleteExercise/:delId", isLoggedIn, async(req, res)=> {
 try {
    const delId = req.params.delId
    const findId = await Exercise.deleteOne({_id: delId});
    req.flash("success", "exercise deleted successfully")
       res.redirect("/app/allWorkout")
 } catch (error) {
    console.log("--error in deleting exercise----")
 }
})

module.exports = router;