const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getCreatorProfile, updateCreatorProfile } = require('../controllers/creatorController');

router.get('/profile', authMiddleware, getCreatorProfile);
router.put('/profile', authMiddleware, updateCreatorProfile);

module.exports = router;