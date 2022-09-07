const mongoose = require('mongoose');

const connectDatabase = () => {mongoose.connect(process.env.DB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    }).then((data) => {
        console.log(`Mongo connected with server ${data.connection.host}`);
    })
    // .catch((err) => {
    //     console.log(err);
    // })
    //catch nii use kr rhe as hum error ko server.js me handle kr rhe 
    //Unhandled rejection ke roop me
};

module.exports = connectDatabase;