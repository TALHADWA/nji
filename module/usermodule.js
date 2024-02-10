const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0,  // Use a colon here instead of a semicolon
    }
});

module.exports = mongoose.model('User', userSchema);
