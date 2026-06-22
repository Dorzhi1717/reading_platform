const multer = require('multer');
const path = require('path');
const { TextMessage, VoiceMessage, User, BookClub } = require('../models/models');
const { transcribeAudio } = require('../services/whisper.service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `voice_${Date.now()}.webm`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).single('audio');

async function getMessages(req, res) {
  try {
    const { club_id } = req.params;
    const { limit = 50 } = req.query;

    const textMessages = await TextMessage.findAll({
      where: { club_id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['sent_at', 'ASC']],
      limit: parseInt(limit)
    });

    const voiceMessages = await VoiceMessage.findAll({
      where: { club_id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['sent_at', 'ASC']],
      limit: parseInt(limit)
    });

    const allMessages = [
      ...textMessages.map(m => ({
        type: 'text',
        id: `text_${m.message_id}`,
        user_id: m.user_id,
        author_name: m.User?.username,
        text: m.message,
        audio_url: null,
        created_at: m.sent_at
      })),
      ...voiceMessages.map(m => ({
        type: 'voice',
        id: `voice_${m.voice_id}`,
        user_id: m.user_id,
        author_name: m.User?.username,
        text: m.transcript || '[Голосовое сообщение]',
        audio_url: m.audio_path,
        created_at: m.sent_at
      }))
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json(allMessages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function uploadVoice(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    const { club_id } = req.body;
    if (!club_id) return res.status(400).json({ message: 'club_id обязателен' });
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });

    const voice = await VoiceMessage.create({
      user_id: req.user.user_id,
      club_id: parseInt(club_id),
      audio_path: req.file.filename
    });

    const filePath = req.file.path;
    const transcript = await transcribeAudio(filePath);
    
    if (transcript) {
      await VoiceMessage.update(
        { transcript },
        { where: { voice_id: voice.voice_id } }
      );
    }

    res.status(201).json(voice);
  });
}

async function deleteMessage(req, res) {
  try {
    const { message_id } = req.params;
    
    const msg = await TextMessage.findByPk(message_id);
    if (!msg) return res.status(404).json({ message: 'Сообщение не найдено' });

    const club = await BookClub.findByPk(msg.club_id);
    if (msg.user_id !== req.user.user_id && 
        club.creator_id !== req.user.user_id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав' });
    }

    await msg.destroy();
    res.json({ message: 'Сообщение удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMessages, uploadVoice, deleteMessage };