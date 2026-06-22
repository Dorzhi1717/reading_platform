const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMessages, uploadVoice, deleteMessage } = require('../controllers/chat.controller');

router.get('/:club_id', authenticate, getMessages);
router.post('/voice', authenticate, uploadVoice);
router.delete('/message/:message_id', authenticate, deleteMessage);

module.exports = router;