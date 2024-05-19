const express = require("express");
const router = express.Router();
const{register,loginUser,sendOtpForForgetPassword,updatePassword}=require("../controllers/userController");
router.post("/register",register);
router.post("/login",loginUser);
router.post("/sendOtp",sendOtpForForgetPassword);
router.post("/resetPassword",updatePassword)
module.exports = router;
