const express = require("express");
const router = express.Router();
const{register,loginUser,sendOtpForForgetPassword,updatePassword}=require("../controllers/userController");
router.post("/register",register);
router.post("/login",loginUser);
// api for forget password ! You can update the password via mail otp method 
router.post("/sendOtp",sendOtpForForgetPassword);
router.post("/resetPassword",updatePassword)
module.exports = router;
