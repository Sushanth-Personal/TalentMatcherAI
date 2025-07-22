const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  // Existing fields
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  charges: { type: Number, required: true }, // Likely the creator's base price
  services: { type: [String], required: true },
  serviceDescription: { type: String, required: true },
  specialHighlights: { type: [String], required: true },
  pictureUrl: { type: String, required: true },
  contact: { type: String, required: true },
  availability: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: String }, // Existing, may need to update to Number
  budgetRange: { type: String }, // e.g., "₹50000-₹100000"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // New fields
  isVerified: { type: Boolean, default: false },
  verificationDocs: [{ type: String }], // Array of URLs or file paths
  ratingsAverage: { type: String, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0, min: 0 },
  reviews: [{
    reviewText: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
  responseTime: { type: Number, default: 24 }, // Average response time in hours
  completionRate: { type: Number, default: 100, min: 0, max: 100 },
  lastActive: { type: Date, default: Date.now },
  preferredLocations: [{ type: String }],
  preferredGigTypes: [{ type: String }],
  workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
  certifications: [{ type: String }],
  awards: [{ type: String }],
  mediaFeatures: [{ type: String }],
  gigsCompleted: { type: Number, default: 0, min: 0 },
  clientRepeatRate: { type: Number, default: 0, min: 0, max: 100 },
  portfolioLink: { type: String, default: '' }, // Single URI, no validation
}, { timestamps: true });

// Index for performance
CreatorSchema.index({ createdBy: 1 });
CreatorSchema.index({ location: 1, category: 1 }); // Add index for search performance

module.exports = mongoose.model('Creator', CreatorSchema);