const express = require("express");
const router = express.Router();
const passport = require("../config/passport-config");
const isLoggedIn = require("../middleware/isLoggedIn");

const { User, Log, Exercise, Food} = require("../models");



router.get("/food/:foodId", async(req, res) => {
    
    try {
        const foodId = req.params.foodId;
        const logId = req.query.logId
        res.render("app/food", {foodId: foodId})
    } catch (error) {
        console.log("---error to find foods---",error)
    }
})

router.get("/showfood/:foodId", async(req, res)=> {
    try {
        const  foodId  = req.params.foodId;
        const logId = req.query.logId
        const food = await Exercise.findById(foodId).populate("foods");
        res.render("app/showFood", {food: food, logId: logId})
    } catch (error) {
        console.log("---error shoing the foods--", error)
    }
})

router.get("/editfood/:foodId/edit", async(req, res)=> {
    try {
        const foodId = req.params.foodId;

        const specificFoodId = await Food.findById(foodId)
        res.render("app/editFood", {foodIdNew: specificFoodId})
    } catch (error) {
        console.log("---error editing the foods--", error)
    }
})

router.get("/deletefood/:foodId/delete", async(req, res)=> {
    try {
        const delFood = req.params.foodId;

        const delFoodId = await Food.findById(delFood);
        // console.log(delFoodId)
        res.render("app/deleteFood", {delFoodId2: delFoodId})
    } catch (error) {
        console.log("error deleting the food", error)
    }
})


router.post("/food/:foodId", async(req,res) => {
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
    //   console.log("new food", newFood);
    } catch (error) {
        console.log("---error to post foods---",error)
    }
})

router.put("/editfood/:foodId", async(req, res) => {
    console.log("---updated food---", req.body)
    try {
        const foodId = req.params.foodId;

        const updateFood = await Food.updateOne({_id: foodId}, {$set : {
            meal1: req.body.meal1,
            meal2: req.body.meal2,
            meal3: req.body.meal3,
            meal4: req.body.meal4,
            notes: req.body.notes
        }})

        res.redirect("/app/allWorkout")
    } catch (error) {
        console.log("---error to error showing edited foods---",error)
    }
})

router.delete("/deletefood/:foodId", async(req, res) => {

try {
    const foodId = req.params.foodId;

    const delId = await Food.deleteOne({_id: foodId});
    res.redirect("/app/allWorkout")
} catch (error) {
    console.log("--error deleting the food-----")
}

})

module.exports = router;