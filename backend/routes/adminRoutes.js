const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { addTalent, editTalent, getTalents } = require('../controllers/adminController');

// Admin routes for talent management
router.post('/talents', authMiddleware, adminMiddleware, addTalent);
router.put('/talents/:id', authMiddleware, adminMiddleware, editTalent);
router.get('/talents', authMiddleware, adminMiddleware, getTalents);

module.exports = router;