class ErrorHandler extends Error{  //extends mtlb node ki jo apni error class hai usko inherit kr liye
    constructor(message, statusCode){
        super(message); //super ko aise samaj skte ki vo Error class ka constructor hai
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;