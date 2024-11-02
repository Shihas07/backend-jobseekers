const express=require("express")
  const UserController=require("../controller/user")
  const router=express.Router()
  const authUser=require("../midIware/userAuth")
  const uploadStorage =require("../midIware/multer")

  
  router.post("/signup",UserController.signup)
 router.post("/login",UserController.login)
 router.post("/otpLogin",UserController.otpLogin)
 router.post("/verifyOtp",UserController.verifyOtp)
//  router.get("/",UserController.home)
 router.post("/refresh",authUser,UserController.refresh)
 router.get("/getJob",UserController.getJob)
 router.get("/fetchCategory",UserController.fetchCategory)
 router.get("/jobTitle",UserController.jobTitleFilter)
 router.get("/jobLocation",UserController.location)
 router.get("/jobSinglePage/:id",UserController.singleJob)
 router.get("/profileData/:email",UserController.profileDetails)
 router.post("/userDetails", uploadStorage.single('Resume'), UserController.addprofileDetails);
 router.post("/applyJob/:id",UserController.applyJob)
 router.get("/getAppliedJob/:id",UserController.getAppliedJob)
      


  module.exports=router;