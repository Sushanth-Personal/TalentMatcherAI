const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { searchTalents } = require('../controllers/searcherController');


router.post('/talents/search', authMiddleware, searchTalents);


module.exports = router;