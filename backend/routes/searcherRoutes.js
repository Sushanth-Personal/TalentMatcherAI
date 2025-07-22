const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { searchTalents, extractData } = require('../controllers/searcherController');


router.post('/talents/search', authMiddleware, searchTalents);
router.post('/extract', extractData);

module.exports = router;