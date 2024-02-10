const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    deposit: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
    },
    accountnumber: {
        type: String,
    },
    status:{
        type:Boolean,
        default:false
    }
});

const deposits = mongoose.model('deposits', depositSchema);

module.exports = deposits;
