const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors( async(req,res,next) => {

    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    

    req.user = await User.findById(decodeData.id);
    //req.user me store ho gya data, ab jab tak login rhega tb tk user ka data hum yha se le skte

    next();
});

exports.authorizeRoles = (...roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)){ //agar admin role nii hoga to error
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resource`, 403
                )
            );
        }
        next();
    };
}
