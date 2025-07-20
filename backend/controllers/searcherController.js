const Creator = require('../models/Creator');
const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../utils/embeddings');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index(process.env.PINECONE_INDEX);

exports.searchTalents = async (req, res) => {
  try {
    const { query, location } = req.body;
    console.log('Search request:', { query, location, user: req.user });
    if (!query) return res.status(400).json({ message: 'Query is required' });

    let vector;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        vector = await generateEmbedding(query);
        console.log('Vector length:', vector.length);
        break;
      } catch (error) {
        attempts++;
        console.log(`Embedding attempt ${attempts} failed:`, error.message);
        if (attempts === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  const queryOptions = {
      vector,
      topK: 10,
      includeMetadata: true,
      filter: location ? { location: { $eq: location } } : undefined,
    };

    const talentIndex = index.namespace('talents'); // Specify namespace here
    const results = await talentIndex.query(queryOptions);
    console.log('Pinecone results:', results.matches.length);
    const creatorIds = results.matches.map(match => match.id);
    const creators = await Creator.find({ _id: { $in: creatorIds } });
    const sortedCreators = creatorIds
      .map(id => creators.find(c => c._id.toString() === id))
      .filter(c => c)
      .slice(0, 5);

    res.json({ message: 'Search completed', creators: sortedCreators });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search error', error: error.message });
  }
};