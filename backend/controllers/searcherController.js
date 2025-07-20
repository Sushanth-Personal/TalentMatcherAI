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

exports.searchTalents = async (req, res) => {
  try {
    const { query, location } = req.body;
    console.log('Search request:', { query, location, user: req.user });
    if (!query) return res.status(400).json({ message: 'Query is required' });

    // Initialize Pinecone namespace
    const talentIndex = index.namespace('__default__'); // Standardized to 'talents'

    // Prepare filter for Pinecone
    let filter = {};
    if (location) {
      try {
        const coordinates = await getCoordinates(location);
        // Create a ±2 degree range for latitude and longitude
        filter = {
          latitude: {
            $gte: coordinates.latitude - 2,
            $lte: coordinates.latitude + 2,
          },
          longitude: {
            $gte: coordinates.longitude - 2,
            $lte: coordinates.longitude + 2,
          },
        };
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // Perform Pinecone search with filter
    const results = await talentIndex.searchRecords({
      query: {
        topK: 10,
        inputs: { text: query },
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      },
    });

    // Map results to MongoDB creators
    const creatorIds = results.result.hits.map(match => match._id);
    const creators = await Creator.find({ _id: { $in: creatorIds } });
    const sortedCreators = creatorIds
      .map(id => creators.find(c => c._id.toString() === id))
      .filter(c => c)
      .slice(0, 5);

    res.json({ message: 'Search completed', creators: sortedCreators });
  } catch (error) {
    console.error('Search error:', error.stack);
    if (error.status === 401) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or missing Pinecone API key' });
    }
    res.status(500).json({ message: 'Search error', error: error.message });
  }
};

// Test Pinecone connectivity
exports.testPinecone = async (req, res) => {
  try {
    const stats = await index.describeIndexStats();
    res.json({ message: 'Pinecone connection successful', stats });
  } catch (error) {
    console.error('Pinecone test error:', error.stack);
    res.status(500).json({ message: 'Pinecone test failed', error: error.message });
  }
};