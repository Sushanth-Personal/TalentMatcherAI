const mongoose = require('mongoose');

const briefSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  location: { type: String },
  budget: { type: Number },
  category: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Brief', briefSchema);