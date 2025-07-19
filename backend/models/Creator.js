const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  gender: { type: String, required: true, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  charges: { type: Number, required: true, min: 0 },
  services: { type: [String], required: true, validate: [arr => arr.length > 0, 'At least one service is required'] },
  serviceDescription: { type: String, required: true, trim: true },
  specialHighlights: { type: [String], required: true, validate: [arr => arr.length > 0, 'At least one highlight is required'] },
  pictureUrl: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  availability: { type: String, required: true, enum: ['available', 'partially_available', 'unavailable'] },
  category: { type: String, required: true, trim: true },
  experience: { type: String, trim: true },
  budgetRange: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Creator', creatorSchema);