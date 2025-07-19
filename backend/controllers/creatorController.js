const Creator = require('../models/Creator');

// Get all creators
const getAllCreators = async (req, res) => {
  try {
    const creators = await Creator.find();
    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching creators', error });
  }
};

// Add a new creator
const addCreator = async (req, res) => {
  const { name, location, category, experience, budgetRange } = req.body;
  try {
    const newCreator = new Creator({ name, location, category, experience, budgetRange });
    const savedCreator = await newCreator.save();
    res.status(201).json(savedCreator);
  } catch (error) {
    res.status(400).json({ message: 'Error adding creator', error });
  }
};

// Match creators (simplified logic)
const matchCreators = async (req, res) => {
  const { location, budget, category } = req.body;
  try {
    const creators = await Creator.find({
      location: location || { $exists: true },
      budgetRange: { $gte: budget || 0 },
      category: category || { $exists: true },
    }).limit(3);

    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error });
  }
};

module.exports = {
  getAllCreators,
  addCreator,
  matchCreators,
};