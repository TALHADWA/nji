const mongoose = require('mongoose');



mongoose.connect("mongodb+srv://admin:admin@cluster0.8g7cyao.mongodb.net/", {
    serverSelectionTimeoutMS: 5000, // Optional but recommended

}).then(console.log("databse started  "));
