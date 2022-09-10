const app = require('./app');

const dotenv = require('dotenv');
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down server due to uncaught Exception`);
    process.exit(1);    
});
// console.log(MYWORLD);
//THIS IS A UNCAUGHT EXCEPTION

//CONFIG
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({path: "backend/config/config.env"});
}
// dotenv.config({path: "config/config.env"});

//CONNECT DATABASE
connectDatabase();

//CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server running on ${process.env.PORT}`);
});

//Unhandled promise rejection
//ye uss time ke liye hai jaise db_uri galat ho jaaye to server me error aa jaata to uss error ko handle kr rhe
//aur server hum khud close kr de rhe
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down server due to unhandled rejection`);

    server.close(() => {
        process.exit(1);
    });
});