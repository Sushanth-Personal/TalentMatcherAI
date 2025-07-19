const Creator = require('../models/Creator');
const Brief = require('../models/Brief');

// Get all creators for admin
const getAllCreatorsAdmin = async (req, res) => {
  try {
    const creators = await Creator.find();
    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching creators', error });
  }
};

// Add a new creator (admin)
const addCreatorAdmin = async (req, res) => {
  const { name, location, category, experience, budgetRange } = req.body;
  try {
    const newCreator = new Creator({ name, location, category, experience, budgetRange });
    const savedCreator = await newCreator.save();
    res.status(201).json(savedCreator);
  } catch (error) {
    res.status(400).json({ message: 'Error adding creator', error });
  }
};

// Update a creator
const updateCreator = async (req, res) => {
  const { id } = req.params;
  const { name, location, category, experience, budgetRange } = req.body;
  try {
    const updatedCreator = await Creator.findByIdAndUpdate(
      id,
      { name, location, category, experience, budgetRange },
      { new: true, runValidators: true }
    );
    if (!updatedCreator) return res.status(404).json({ message: 'Creator not found' });
    res.json(updatedCreator);
  } catch (error) {
    res.status(400).json({ message: 'Error updating creator', error });
  }
};

// Delete a creator
const deleteCreator = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCreator = await Creator.findByIdAndDelete(id);
    if (!deletedCreator) return res.status(404).json({ message: 'Creator not found' });
    res.json({ message: 'Creator deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting creator', error });
  }
};

// Get all submitted briefs
const getAllBriefs = async (req, res) => {
  try {
    const briefs = await Brief.find().sort({ timestamp: -1 });
    res.json(briefs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching briefs', error });
  }
};

// Add a new brief (from frontend submission)
const addBrief = async (req, res) => {
  const { projectTitle, projectDescription, location, budget, category } = req.body;
  try {
    const newBrief = new Brief({ projectTitle, projectDescription, location, budget, category });
    const savedBrief = await newBrief.save();
    res.status(201).json(savedBrief);
  } catch (error) {
    res.status(400).json({ message: 'Error adding brief', error });
  }
};

module.exports = {
  getAllCreatorsAdmin,
  addCreatorAdmin,
  updateCreator,
  deleteCreator,
  getAllBriefs,
  addBrief,
};