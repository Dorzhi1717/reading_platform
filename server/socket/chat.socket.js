const jwt = require('jsonwebtoken');
const { TextMessage, ClubMember, UserStats } = require('../models/models');

function setupChatSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Требуется авторизация'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Недействительный токен'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`${socket.user.username} подключился`);

    socket.on('chat:join', async ({ club_id }) => {
      const member = await ClubMember.findOne({ where: { user_id: socket.user.user_id, club_id } });
      if (!member) {
        socket.emit('chat:error', { message: 'Вы не состоите в этом клубе' });
        return;
      }
      socket.join(`club_${club_id}`);
    });

    socket.on('chat:leave', ({ club_id }) => {
      socket.leave(`club_${club_id}`);
    });

    socket.on('chat:message', async ({ club_id, text }) => {
      if (!text?.trim()) return;

      const msg = await TextMessage.create({
        user_id: socket.user.user_id, club_id, message: text.trim()
      });

      await UserStats.increment('messages_count', { where: { user_id: socket.user.user_id } });

      io.to(`club_${club_id}`).emit('chat:message', {
        type: 'text', id: msg.message_id, club_id,
        user_id: socket.user.user_id, author_name: socket.user.username,
        text: msg.message, audio_url: null, created_at: msg.sent_at
      });
    });

    socket.on('disconnect', () => {
      console.log(`${socket.user.username} отключился`);
    });
  });
}

module.exports = { setupChatSocket };