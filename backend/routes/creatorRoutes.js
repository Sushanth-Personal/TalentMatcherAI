const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.post('/match', creatorController.matchCreators);

module.exports = router;