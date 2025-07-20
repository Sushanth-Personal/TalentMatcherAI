const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { addTalent, editTalent, getTalents, deleteTalent } = require('../controllers/adminController');

router.post('/talents', authMiddleware, adminMiddleware, addTalent);
router.put('/talents/:id', authMiddleware, adminMiddleware, editTalent);
router.get('/talents', authMiddleware, adminMiddleware, getTalents);
router.delete('/talents/:id', authMiddleware, adminMiddleware, deleteTalent);

module.exports = router;