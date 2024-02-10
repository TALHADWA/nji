const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    withdraw: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
    },
    accountnumber: {
        type: String,
    },
});

const Withdraw = mongoose.model('Withdraw', withdrawSchema);

module.exports = Withdraw;
