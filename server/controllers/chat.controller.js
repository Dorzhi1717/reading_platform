const multer = require('multer');
const path = require('path');
const { TextMessage, VoiceMessage, User } = require('../models/models');
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

    console.log('Файл получен:', req.file.filename);

    const voice = await VoiceMessage.create({
      user_id: req.user.user_id,
      club_id: parseInt(club_id),
      audio_path: req.file.filename
    });

    // ЯВНО вызываем и ЖДЁМ результат
    const filePath = req.file.path;
    console.log('Вызываю Whisper для:', filePath);
    
    const transcript = await transcribeAudio(filePath);
    
    if (transcript) {
      await VoiceMessage.update(
        { transcript },
        { where: { voice_id: voice.voice_id } }
      );
      console.log(`Расшифровка сохранена: "${transcript}"`);
    } else {
      console.log('Расшифровка не получена');
      await VoiceMessage.update(
        { transcript: '[Ошибка распознавания]' },
        { where: { voice_id: voice.voice_id } }
      );
    }

    res.status(201).json(voice);
  });
}

module.exports = { getMessages, uploadVoice };