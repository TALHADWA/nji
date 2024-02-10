const mongoose = require('mongoose');

const Adminschema = new mongoose.Schema({
  
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
});

const Admin = mongoose.model('Admin', Adminschema);

module.exports = Admin;
