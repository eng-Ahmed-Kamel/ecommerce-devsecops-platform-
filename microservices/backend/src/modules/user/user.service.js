
import { generateOTP } from "../../utils/otp.js";
import {  User_model } from "./user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import {OAuth2Client}  from 'google-auth-library';
import { sendEmail } from "../../utils/email/email_service.js";



export const signup=async(req,res)=>{
 let {name,password,email}=req.body;
 //check if user already exist
 let existingEmail = await User_model.findOne({ email });
if (existingEmail) {
  return res.status(400).json({
    status: "fail",
    message: "Email already exists"
  });
}

let existingName = await User_model.findOne({ name });
if (existingName) {
  return res.status(400).json({
    status: "fail",
    message: "Username already exists"
  });
}
      //generate random otp
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, +process.env.saltRounds);
    const hashedPassword = await bcrypt.hash(password, +process.env.saltRounds);
     password=await bcrypt.hash(password,+process.env.saltRounds)
    // create new user
   let user = await User_model.create({ name, email, password: hashedPassword,
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    });

    //send email
   await sendEmail({
  to: user.email,
  otp: otp,
  type: "verifyEmail",
});
   
    
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role:user.role,
        phone:user.phone
      }
    });
}


//resend_otp
export const resend_otp = async (req, res, next) => {
    const user = await User_model.findOne({ email: req.body.email}); 
    if (!user) {
      return res.status(400).json({ status: "fail", message: "User not found" });
    }
    
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, +process.env.saltRounds);

    await User_model.findOneAndUpdate(
      { email: req.body.email },
      { otp: hashedOtp,  otpExpiry: new Date(Date.now() + 10 * 60 * 1000) }
    );

    await sendEmail({
      to: user.email,
      otp: otp,
      type: "verifyEmail",
    });

    res.json({ status: "success", message: "OTP sent successfully" });
};



//verify_account
export const verify_account = async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await User_model.findOne({ email, isblocked:false,deletedAt:null});

    if (!user) {
      return res.status(404).json({ status: "fail", message: "Invalid email" });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: "fail", message: "Account already verified" });
    }

  if (!user.otpExpiry || new Date() > user.otpExpiry) {
  return res.status(400).json({ status: "fail", message: "OTP expired, request a new one" });
}

    const isMatch = await bcrypt.compare(otp, user.otp); 
    if (!isMatch) {
      return res.status(400).json({ status: "fail", message: "Invalid OTP" });
    }

    await user.updateOne({ isVerified: true, otp: null, otpExpiry: null }); 

    res.json({ status: "success", message: "Account verified successfully" });
  } 



  //login
  export const login = async (req, res) => {
  let filter={}
  if(req.body.name){
     filter.name=req.body.name
  }
   if(req.body.email){
     filter.email=req.body.email
  }

  const user = await User_model.findOne({...filter,isblocked:false,deletedAt:null});

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid username or password"
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      status: "fail",
      message: "Please verify your email first"
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid username or password"
    });
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
     sameSite: 'none',  
         secure: true, 
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
     sameSite: 'none',  
         secure: true, 
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

};


//login by google
export const signup_bygoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    
    if (!idToken) {
      return res.status(400).json({ status: "error", message: "idToken is required" });
    }
    
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User_model.findOne({ email });
    if (user) {
      if (user.deletedAt) {
        return res.status(403).json({
          status: "fail",
          message: "Account has been deleted",
        });
      }
      if (user.isblocked) {
        return res.status(403).json({
          status: "fail",
          message: "Account is blocked",
        });
      }
    } else {
      user = await User_model.create({
        name,
        email,
        provider: "google",
        isVerified: true,
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: "success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('[signup_bygoogle] ❌ Error:', err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
};



  //forget password---->use resend_otp function
export const forget_password = async (req, res) => {
  const { email, otp, new_password } = req.body;
  
  console.log("OTP received:", otp);  
  
 const user = await User_model.findOne({email, isblocked:false, deletedAt:null}).lean();
  if (!user) {
    return res.status(404).json({ status: "fail", message: "Invalid email" });
  }

 
  if (!user.otpExpiry || new Date() > user.otpExpiry) {
    return res.status(400).json({ status: "fail", message: "OTP expired" });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  console.log("isMatch:", isMatch);  
   console.log("otp type:", typeof otp);
console.log("otp length:", otp.length);
console.log("isMatch:", isMatch);
  if (!isMatch) {
    return res.status(400).json({ status: "fail", message: "Invalid OTP" });
  }
    const hashedPassword = await bcrypt.hash(new_password, +process.env.saltRounds);
    await User_model.updateOne({email},{password:hashedPassword}); 
    res.json({ status: "success", message: "password updated successfully" });

  }


  //user profile
  export const getuser=async (req,res)=>{

   res.json({ status: "success", user: req.user });

  }

//update userinfo
export const update_user=async(req,res)=>{
 let filter = {};
    if (req.body.name) filter.name = req.body.name;
    if (req.body.email) filter.email = req.body.email; 
    if (req.body.phone) filter.phone = req.body.phone; 
    if (req.body.Address) filter.Address = req.body.Address;
    let user = await User_model.findOneAndUpdate(
      { email: req.user.email, deletedAt: null }, 
      filter,
      { new: true } 
    );

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }

    res.status(201).json({
      status: "success",
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
        ,Address:user.Address
      }
    });

}

export const delete_user=async(req,res)=>{
 const user = await User_model.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }
    // soft delete
    await User_model.updateOne(
  { email: req.user.email },
  { deletedAt: new Date() }
);
    res.json({
      status: "success",
      message: "User soft deleted successfully",
    });
}



  //logout
  export const logout = async(req,res)=>{
res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.json({
    status:"success",
    message:"logged out"
  })

}


export const getall_users=async(req,res)=>{
 const users = await User_model.find({ _id: { $ne: req.user.id } })
    
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ success: true,count: users.length,users });
  } 


export const BlockAndUnblock = async (req, res) => {
  const id = req.params.id; 

  const user = await User_model.findOne(
    {_id:id}
  );

  if (!user) {
    return res.status(404).json({ message: "No user with this id" });
  }
 user.isblocked = !user.isblocked;
  await user.save()

  res.status(200).json({
    success: true,
    message: "user updated successfully",
    user, 
  });
};