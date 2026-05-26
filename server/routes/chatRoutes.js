const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getUserChats, getChatMessages, sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.get('/', authenticate, getUserChats);
router.get('/:chatId/messages', authenticate, getChatMessages);
router.post('/send', authenticate, sendMessage);

module.exports = router;
