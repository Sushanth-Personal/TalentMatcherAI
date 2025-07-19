const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  charges: { type: Number, required: true }, // e.g., 75000
  services: { type: [String], required: true }, // e.g., ["Photography", "Videography"]
  serviceDescription: { type: String, required: true },
  specialHighlights: { type: [String], required: true }, // e.g., ["Award-winning", "10+ years experience"]
  pictureUrl: { type: String, required: true }, // URL to profile picture
  contact: { type: String, required: true }, // e.g., email or phone
  availability: { type: String, enum: ['available', 'partially_available', 'unavailable'], required: true },
  category: { type: String, required: true }, // e.g., "Photography"
  experience: { type: String }, // e.g., "5 years"
  budgetRange: { type: String }, // e.g., "₹50000-₹100000"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who added the talent
}, { timestamps: true });

module.exports = mongoose.model('Creator', creatorSchema);