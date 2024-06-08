const express = require("express");
const router = express.Router();
const passport = require("../config/passport-config");
const isLoggedIn = require("../middleware/isLoggedIn");

const { User} = require("../models");

//--Authenticated route----go to user profille page--
router.get("/profile", isLoggedIn, (req, res) => {
    newUser = req.user._id
   const { name, email, phone, weight, height, level, goal, gender } = req.user;
   res.render("profile", { name, email, phone, weight, height, level, goal, gender})
});

router.get("/profile/edit/:profileId", isLoggedIn, async(req,res)=> {
    const profile = req.params.profileId;
    console.log("profile Id", profile)

          res.render("editProfile", {profile: profile})


});

router.get("/profile/delete/:delId", isLoggedIn, async(req,res)=> {
    try {
        const delId = req.params.delId;
        console.log("delete id", delId);
        const findId = await User.findById(delId);
        res.render("deleteProfile", {delId: findId})
    } catch (error) {
        console.log("--error while deleting data---", error)
    }
})



router.put("/profile/edit/:profileId", isLoggedIn, async(req, res)=> {

    
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

router.delete("/profile/deleteProfile/:delId", isLoggedIn, async(req, res)=> {
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



module.exports = router;
