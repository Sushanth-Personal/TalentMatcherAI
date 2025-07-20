// controllers/adminController.js
const { Pinecone } = require('@pinecone-database/pinecone');
const Creator = require('../models/Creator');

const fetch = globalThis.fetch;
// Initialize Pinecone client
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX, process.env.PINECONE_INDEX_HOST || 'https://talentsearch-8ez6h41.svc.aped-4627-b74a.pinecone.io');

// Function to get coordinates from city name using Open-Meteo
async function getCoordinates(cityName) {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${data.message || 'Failed to fetch coordinates'}`);
    }
    if (!data.results || data.results.length === 0) {
      throw new Error(`No coordinates found for city: ${cityName}`);
    }
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  } catch (error) {
    console.error('Geocoding error:', error.stack);
    throw new Error(`Failed to get coordinates for ${cityName}: ${error.message}`);
  }
}

// Add a new talent
exports.addTalent = async (req, res) => {
  try {
    const {
      name, location, age, gender, charges, services, serviceDescription,
      specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange
    } = req.body;

    // Input validation
    if (!name || !location || !age || !gender || !charges || !services || !serviceDescription || 
        !specialHighlights || !pictureUrl || !contact || !availability || !category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (!/^[a-zA-Z\s]+$/.test(location)) {
      return res.status(400).json({ message: 'Location must contain only letters and spaces' });
    }
    if (!/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(pictureUrl)) {
      return res.status(400).json({ message: 'Invalid picture URL' });
    }
    if (services.length === 0 || specialHighlights.length === 0) {
      return res.status(400).json({ message: 'Services and special highlights must not be empty' });
    }
    if (!Number.isInteger(age) || age <= 0) {
      return res.status(400).json({ message: 'Age must be a positive integer' });
    }
    if (typeof charges !== 'number' || charges <= 0) {
      return res.status(400).json({ message: 'Charges must be a positive number' });
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(contact)) {
      return res.status(400).json({ message: 'Invalid contact email' });
    }

    // Get coordinates for location
    let coordinates;
    try {
      coordinates = await getCoordinates(location);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Save to MongoDB
    const creator = new Creator({
      name, location, age, gender, charges, services, serviceDescription,
      specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      createdBy: req.user.id,
    });
    await creator.save();

    // Generate text for Pinecone embedding
    const text = `${services.join(', ')} ${serviceDescription} ${location} ${experience || ''} experience ${specialHighlights.join(', ')}`;
    console.log('Upserting text for talent:', creator._id, 'text:', text);

    // Upsert to Pinecone using upsertRecords
    try {
      await index.namespace('__default__').upsertRecords([{
        id: creator._id.toString(),
        text: text,
        name,
        category,
        location,
        budgetRange,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }]);
    } catch (upsertError) {
      console.error('Pinecone upsertRecords error:', upsertError.stack);
      if (upsertError.status === 401) {
        throw new Error('Unauthorized: Invalid or missing Pinecone API key');
      }
      throw new Error('Failed to upsert talent to Pinecone');
    }

    res.status(201).json({ message: 'Talent added successfully', creator });
  } catch (error) {
    console.error('Add talent error:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit an existing talent
exports.editTalent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, location, age, gender, charges, services, serviceDescription,
      specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange
    } = req.body;

    // Input validation
    if (!name || !location || !age || !gender || !charges || !services || !serviceDescription || 
        !specialHighlights || !pictureUrl || !contact || !availability || !category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (!/^[a-zA-Z\s]+$/.test(location)) {
      return res.status(400).json({ message: 'Location must contain only letters and spaces' });
    }
    if (!/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(pictureUrl)) {
      return res.status(400).json({ message: 'Invalid picture URL' });
    }
    if (services.length === 0 || specialHighlights.length === 0) {
      return res.status(400).json({ message: 'Services and special highlights must not be empty' });
    }
    if (!Number.isInteger(age) || age <= 0) {
      return res.status(400).json({ message: 'Age must be a positive integer' });
    }
    if (typeof charges !== 'number' || charges <= 0) {
      return res.status(400).json({ message: 'Charges must be a positive number' });
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(contact)) {
      return res.status(400).json({ message: 'Invalid contact email' });
    }

    // Find and authorize
    const creator = await Creator.findById(id);
    if (!creator) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    if (creator.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this talent' });
    }

    // Get coordinates for location
    let coordinates;
    try {
      coordinates = await getCoordinates(location);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Update MongoDB
    const updatedCreator = await Creator.findByIdAndUpdate(
      id,
      {
        name, location, age, gender, charges, services, serviceDescription, specialHighlights,
        pictureUrl, contact, availability, category, experience, budgetRange,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      },
      { new: true }
    );

    // Generate text for Pinecone embedding
    const text = `${services.join(', ')} ${serviceDescription} ${location} ${experience || ''} experience ${specialHighlights.join(', ')}`;
    console.log('Upserting text for talent:', id, 'text:', text);

    // Upsert to Pinecone using upsertRecords
    try {
      await index.namespace('__default__').upsertRecords([{
        id: id,
        text: text,
        name,
        category,
        location,
        budgetRange,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }]);
    } catch (upsertError) {
      console.error('Pinecone upsertRecords error:', upsertError.stack);
      if (upsertError.status === 401) {
        throw new Error('Unauthorized: Invalid or missing Pinecone API key');
      }
      throw new Error('Failed to upsert talent to Pinecone');
    }

    res.json({ message: 'Talent updated successfully', creator: updatedCreator });
  } catch (error) {
    console.error('Edit talent error:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a talent
exports.deleteTalent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and authorize
    const creator = await Creator.findById(id);
    if (!creator) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    if (creator.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this talent' });
    }

    // Delete from MongoDB
    await Creator.findByIdAndDelete(id);

    // Delete from Pinecone
    try {
      await index.namespace('__default__').deleteOne(id);
    } catch (deleteError) {
      console.error('Pinecone delete error:', deleteError.stack);
      if (deleteError.status === 401) {
        throw new Error('Unauthorized: Invalid or missing Pinecone API key');
      }
      throw new Error('Failed to delete talent from Pinecone');
    }

    res.json({ message: 'Talent deleted successfully' });
  } catch (error) {
    console.error('Delete talent error:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all talents for the authenticated user
exports.getTalents = async (req, res) => {
  try {
    const creators = await Creator.find({ createdBy: req.user.id });
    res.json(creators);
  } catch (error) {
    console.error('Get talents error:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};