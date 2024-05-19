const User=require("../models/userModel");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const nodemailer=require("nodemailer");
// user registration start 
const register=async(req,res)=>{
    try {
        const { username, email, password } = req.body;
    
        if (!username || !email || !password) {
          return res.status(400).json({ message: 'All fields are required' });
        }
    
        const existingUser = await User.findOne({email});
        if (existingUser) {
          return res.status(400).json({ message: 'User already registered' });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({
          username,
          email,
          password: hashedPassword
        });
        
        await newUser.save();

        res.status(201).send({
          success:true,
          message:"Registration is successful"
        });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
}
//user registration end 

// login user start
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({success:false, message: 'All fields are required' });
    }
  
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success:false,message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({success:false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({
      success:true,
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({success:false, message: 'Server error', error: error.message });
  }
};
//login user end

const sendOtpForForgetPassword = async (req, res) => {
  // console.log(req.body);
   const _otp = Math.floor(100000 + Math.random() * 900000);
   //console.log(_otp);
   let user = await User.findOne({ email: req.body.email });
   // Check if user exists
   if (!user) {
     return res.status(500).json({ success: false, message: "User not found" });
   }
 
   try {
   
     let transporter = nodemailer.createTransport({
       service: "gmail",
       auth: {
         user: process.env.EMAIL,
         pass: process.env.PASSWORD,
       },
     });
 
     // Send email with OTP
     let info = await transporter.sendMail({
       from: process.env.EMAIL,
       to: req.body.email,
       subject: "OTP for Forget Password",
       text: String(_otp),
       html: `<html>
         <body>
           <h1>Hello and welcome,</h1>
           <h2>Your OTP is: <strong>${_otp}</strong></h2>
         </body>
       </html> `,
     });
 
     // Check if email was sent successfully
     if (info.messageId) {
       // Update user with OTP
       await User.updateOne({ email: req.body.email }, { otp: _otp });
       return res.status(200).json({ success: true, message: "OTP sent" });
     } else {
       // If email failed to send
       return res.status(500).json({ success: false, message: "Server error" });
     }
   } catch (error) {
     console.error("Error sending email:", error);
     return res.status(500).json({ success: false, message: "Server error" });
   }
 };
 
 // send OTP via Mail END //
 
 // update Password By OTP START //
 
 const updatePassword = async (req, res) => {
   try {
     console.log(req.body);
 
     if (!req.body.otp || !req.body.password) {
       return res
         .status(400)
         .send({ success: false, message: "Both Fields are required" });
     }
 
     const result = await User.findOne({ otp: req.body.otp });
 
     if (!result) {
       return res.status(404).send({ success: false, message: "OTP is Wrong" });
     }
 
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(req.body.password, salt);
 
     await User.updateOne(
       { email: result.email },
       { password: hashedPassword }
     );
 
     res.status(200).send({ success: true, message: "Password updated" });
   } catch (error) {
     console.error(error);
     res
       .status(500)
       .send({ success: false, message: error.message || "Server error" });
   }
 };
module.exports={register,loginUser,sendOtpForForgetPassword,updatePassword}