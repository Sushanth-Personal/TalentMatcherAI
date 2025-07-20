// models/Creator.js
const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number }, // New field for latitude
  longitude: { type: Number }, // New field for longitude
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  charges: { type: Number, required: true },
  services: { type: [String], required: true },
  serviceDescription: { type: String, required: true },
  specialHighlights: { type: [String], required: true },
  pictureUrl: { type: String, required: true },
  contact: { type: String, required: true },
  availability: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: String },
  budgetRange: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Index for performance
CreatorSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Creator', CreatorSchema);