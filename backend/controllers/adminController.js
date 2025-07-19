const Creator = require('../models/Creator');

exports.addTalent = async (req, res) => {
  try {
    const {
      name,
      location,
      age,
      gender,
      charges,
      services,
      serviceDescription,
      specialHighlights,
      pictureUrl,
      contact,
      availability,
      category,
      experience,
      budgetRange,
    } = req.body;

    // Server-side validation
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

    const creator = new Creator({
      name,
      location,
      age,
      gender,
      charges,
      services,
      serviceDescription,
      specialHighlights,
      pictureUrl,
      contact,
      availability,
      category,
      experience,
      budgetRange,
      createdBy: req.user.id,
    });

    await creator.save();
    res.status(201).json({ message: 'Talent added successfully', creator });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editTalent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      age,
      gender,
      charges,
      services,
      serviceDescription,
      specialHighlights,
      pictureUrl,
      contact,
      availability,
      category,
      experience,
      budgetRange,
    } = req.body;

    // Server-side validation
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

    const creator = await Creator.findById(id);
    if (!creator) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    if (creator.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this talent' });
    }

    const updatedCreator = await Creator.findByIdAndUpdate(
      id,
      { name, location, age, gender, charges, services, serviceDescription, specialHighlights, pictureUrl, contact, availability, category, experience, budgetRange },
      { new: true }
    );
    res.json({ message: 'Talent updated successfully', creator: updatedCreator });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTalents = async (req, res) => {
  try {
    const creators = await Creator.find({ createdBy: req.user.id });
    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};