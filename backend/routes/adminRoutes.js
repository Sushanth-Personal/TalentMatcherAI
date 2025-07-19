const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin - Get all creators
router.get('/creators', adminController.getAllCreatorsAdmin);

// Admin - Add a new creator
router.post('/creators', adminController.addCreatorAdmin);

// Admin - Update a creator
router.put('/creators/:id', adminController.updateCreator);

// Admin - Delete a creator
router.delete('/creators/:id', adminController.deleteCreator);

// Admin - Get all briefs
router.get('/briefs', adminController.getAllBriefs);

// Admin - Add a brief (for testing or frontend integration)
router.post('/briefs', adminController.addBrief);

module.exports = router;