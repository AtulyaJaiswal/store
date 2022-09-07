const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //build in module

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name"],
        maxLength:[30, "Name should be less than 30 characters"],
        minLength:[4,"Name should have more than 4 characters"],
    },
    email:{
        type:String,
        required:[true, "Please enter your email"],
        unique:true,
        validate:[validator.isEmail, "Please enter a valid email"],
    },
    password:{
        type:String,
        required:[true, "Please enter your password"],
        minLength:[8,"Password should have more than 8 characters"],
        select:false, //jb find method se data mangainge to ye nii aaiag
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

//PASSWORD HASHING
userSchema.pre("save", async function(next){ //arrow function nii use kiye as this use krna
    //.pre("save") = save krne se pehle ye krna

    if(!this.isModified("password")){ //agar ye nii lgainge aur name email update krenge to save fir call hoga aur
                                      //password fir se hash kr dega jo galat hai
        next();
    }

    this.password = await bcrypt.hash(this.password,10);

});

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//COMPARE PASSWORD
//galat password par bhi shi de raa filhaal
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

//GENERATING PASSWORD RESET TOKEN
userSchema.methods.getResetPasswordToken = function () {

    //GENERATING TOKEN
    const resetToken = crypto.randomBytes(20).toString("hex"); 

    //HASHING & ADDING resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);