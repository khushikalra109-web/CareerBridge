const Chat = require('../models/Chat');
const User = require('../models/User');

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name email role company')
      .sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load chats.' });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId || !require('mongoose').Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat id.' });
    }

    const chat = await Chat.findById(chatId).populate('messages.senderId', 'name role');
    if (!chat || !chat.participants.map((id) => id.toString()).includes(req.user.id)) {
      return res.status(404).json({ message: 'Chat not found.' });
    }
    res.json({ chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load chat messages.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, recipientId, text } = req.body;
    if (!text || (!chatId && !recipientId)) {
      return res.status(400).json({ message: 'Chat id or recipient and text are required.' });
    }

    let chat;
    if (chatId) {
      if (!require('mongoose').Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: 'Invalid chat id.' });
      }
      chat = await Chat.findById(chatId);
    } else {
      if (!recipientId || !require('mongoose').Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ message: 'Invalid recipient id.' });
      }

      const existing = await Chat.findOne({
        participants: { $all: [req.user.id, recipientId] },
      });
      if (existing) {
        chat = existing;
      } else {
        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: 'Recipient not found.' });
        chat = new Chat({ participants: [req.user.id, recipientId], messages: [] });
      }
    }

    chat.messages.push({ senderId: req.user.id, text });
    await chat.save();

    const populated = await Chat.findById(chat._id).populate('participants', 'name email role');
    res.status(201).json({ chat: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to send message.' });
  }
};
