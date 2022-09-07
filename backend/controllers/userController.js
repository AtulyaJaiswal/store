const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//REGISTER USER
exports.registerUser = catchAsyncErrors(async(req,res,next) => {

    
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 300,
        crop: "scale"
    });
    // console.log(myCloud);

    const { name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });

    sendToken(user,201,res);
});

//LOGIN USER
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    //checking both email and password given or not
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password both", 400));
    }

    const user = await User.findOne({ email }).select("+password"); //as password ka select false hai isliye 
                                                                    //alag se handle krna pd raa
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);

});

//LOGOUT USER
exports.logout = catchAsyncErrors(async (req,res,next) =>{

    res.cookie("token",null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

//FORGOT PASSWORD
exports.forgotPassword = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    //GET ResetPasswordToken
    const resetToken = user.getResetPasswordToken();

    //token hmne keval generate kiya tha function me, save nii kiya tha schema me, isliye ab save kr rhe
    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    //req.protocol is to get http/https
    //req.get("host") is for getting url of website


    // const resetPasswordUrl = `http:localhost:3000/password/reset/${resetToken}`; 
    // upar waala na chale to ye use kr lo 3000/4000
    // /api/v1 nii rhega as frontend me access krna ye backend ke liye hai 
    // host krne pr yhi lag jaiga ${req.protocol}://${req.get("host")}
    
    
   //MESSAGE TO BE SENT ON EMAIL
   const message = `Your Password reset token is :- \n
   \n ${resetPasswordUrl} \n
   \n If you have not requested this email then, please ignore it`;
   
   try {

        await sendEmail({
            email: user.email,
            subject: `Ecom password recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`
        });
    
   } catch (error) {
        user.resetPasswordToken=d=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500));
   }
});


//RESET PASSWORD
exports.resetPassword = catchAsyncErrors(async(req,res,next) => {

    //create token hash to match token in database
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token) //jo link bhej rhe usme se token le lenge
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}, //time expire hua ya nii check kr rhe
    });

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or expired", 400));
    }
    
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken=d=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user, 200, res);
});

//GET USER DETAILS
exports.getUserDetails = catchAsyncErrors(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    });
});

//UPDATE USER PASSWORD
exports.updatePassword = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

//UPDATE USER PROFILE
exports.updateProfile = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };
    
    //CLOUDINARY FOR AVATAR
    if(req.body.avatar !==""){
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        //deletes the previous photo
        await cloudinary.v2.uploader.destroy(public_id);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});


//GET ALL USERS (ADMIN)
exports.getAllUsers = catchAsyncErrors(async(req,res,next) => {

    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    });
});

//GET SINGLE USER (ADMIN)
exports.getSingleUser = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

//UPDATE USER ROLE
exports.updateUserRole = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.user.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

//DELETE USER --ADMIN
exports.deleteUser = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
    }

    const imageId = user.avatar.public_id;

    //deletes the previous photo
    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});