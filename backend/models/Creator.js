const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: String, required: true },
  budgetRange: { type: String, required: true },
});

module.exports = mongoose.model('Creator', creatorSchema);