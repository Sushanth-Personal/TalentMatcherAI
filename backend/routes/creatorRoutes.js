const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.get('/', creatorController.getAllCreators);
router.post('/', creatorController.addCreator);
router.post('/match', creatorController.matchCreators);

module.exports = router;