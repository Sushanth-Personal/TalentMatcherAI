const Creator = require('../models/Creator');
const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX, process.env.PINECONE_INDEX_HOST || undefined);


exports.getCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findOne({ createdBy: req.user.id });
    if (!creator) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }
    res.json(creator);
  } catch (error) {
    console.error('Get creator profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCreatorProfile = async (req, res) => {
  try {
    const {
      name, location, age, gender, charges, services, serviceDescription,
      specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange
    } = req.body;

    if (!name || !location || !age || !gender || !charges || !services || !serviceDescription || !specialHighlights || !pictureUrl || !contact || !availability || !category) {
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

    let creator = await Creator.findOne({ createdBy: req.user.id });
    if (!creator) {
      creator = new Creator({
        name, location, age, gender, charges, services, serviceDescription,
        specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange,
        createdBy: req.user.id,
      });
    } else {
      creator.set({ name, location, age, gender, charges, services, serviceDescription, specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange });
    }
    await creator.save();

    const text = `${services.join(', ')} ${serviceDescription} ${specialHighlights.join(', ')}`;
    console.log('Upserting text for creator:', creator._id, 'text:', text);
    await index.namespace('__default__').update([{
      id: creator._id.toString(),
      "text":text,
       name, category, location, budgetRange, text,
    }]);

    res.json({ message: 'Profile updated successfully', creator });
  } catch (error) {
    console.error('Update creator profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};