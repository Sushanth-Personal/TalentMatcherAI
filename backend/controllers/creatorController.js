const Creator = require('../models/Creator');

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
  matchCreators,
};