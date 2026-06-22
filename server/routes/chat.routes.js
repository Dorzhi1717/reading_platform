const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMessages, uploadVoice } = require('../controllers/chat.controller');

router.get('/:club_id', authenticate, getMessages);
router.post('/voice', authenticate, uploadVoice);

module.exports = router;