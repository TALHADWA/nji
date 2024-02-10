const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    currentbalance: {
        type: String,
        required: true
    }, 
    useremail: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    profit: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    formattedTimestamp: String // Store formatted timestamp
});

resultSchema.pre('save', function(next) {
    const options = {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    this.formattedTimestamp = this.timestamp.toLocaleString('en-US', options);
    next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
