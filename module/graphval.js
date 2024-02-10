const mongoose = require('mongoose');

const graphSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const GraphData = mongoose.model('GraphData', graphSchema);

module.exports = GraphData;
