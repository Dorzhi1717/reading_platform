require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models.js')
const cors = require('cors');

const http = require('http')
const path = require('path')
const { Server } = require('socket.io')
const { errorHandler } = require('./middleware/errorHandler')
const { setupChatSocket } = require('./socket/chat.socket')

const authRoutes = require('./routes/auth.routes')
const clubsRoutes = require('./routes/clubs.routes')
const booksRoutes = require('./routes/books.routes')
const chatRoutes = require('./routes/chat.routes')
const statsRoutes = require('./routes/stats.routes')


const app = express()

app.use(cors())
app.use(express.json());

// Заголовки для аудио
app.use('/uploads', (req, res, next) => {
  if (req.url.endsWith('.webm')) {
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Accept-Ranges', 'bytes');
  }
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webm')) {
      res.set('Content-Type', 'audio/webm');
    }
  }
}));


app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'] }
});
setupChatSocket(io);

const PORT = process.env.PORT || 3000

const start = async() =>{
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, () => console.log('Server started on port: ' + PORT))   
    } catch (e) {
        console.log(e)
        
    }
}

start()