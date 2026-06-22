const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserStats } = require('../models/models');

async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email и password обязательны' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Создаём пользователя — created_at проставится базой автоматически
    const user = await User.create({
      username,
      email,
      password_hash: hash,
      role: role || 'student'
    });

    // Перезагружаем, чтобы получить created_at из базы
    await user.reload();

    await UserStats.create({ user_id: user.user_id });

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const stats = await UserStats.findByPk(req.user.user_id);

    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      stats: stats || { books_count: 0, clubs_count: 0, messages_count: 0 }
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, me };