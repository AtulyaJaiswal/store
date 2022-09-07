const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";


    //Wrong MONGODB Id error called as castError
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //Mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered` //apne aap le lega jo duplicate hoga
        err = new ErrorHandler(message, 400);
    }

    //Wrong JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }

    //JWT Expire Error
    if(err.name === "TokenExpireError"){
        const message = `Json Web Token is expired, try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message, //err.stack use krenge jo hmne error hander me stack bnaya tha to poora detail aa jaiga
                              //kya error kha se aaya kaise aaya etc
    });
}


