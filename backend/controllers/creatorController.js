const Creator = require('../models/Creator');
const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../utils/embeddings');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index(process.env.PINECONE_INDEX);

exports.getProfile = async (req, res) => {
  try {
    const creator = await Creator.findOne({ createdBy: req.user.id });
    if (!creator) return res.status(404).json({ message: 'Profile not found' });
    res.json(creator);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name, location, age, gender, charges, services, serviceDescription,
      specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange
    } = req.body;

    const creator = await Creator.findOne({ createdBy: req.user.id });
    if (!creator) return res.status(404).json({ message: 'Profile not found' });

    const updatedCreator = await Creator.findByIdAndUpdate(
      creator._id,
      { name, location, age, gender, charges, services, serviceDescription, specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange },
      { new: true }
    );

    const text = `${services.join(', ')} ${serviceDescription} ${specialHighlights.join(', ')}`;
    const vector = await generateEmbedding(text);
    await index.namespace('talents').upsert([{
      id: creator._id.toString(),
      values: vector,
      metadata: { name, category, location },
    }]);

    res.json({ message: 'Profile updated successfully', creator: updatedCreator });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};