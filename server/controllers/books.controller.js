const { Book, UserStats } = require('../models/models');

async function getMyBooks(req, res) {
  const books = await Book.findAll({ where: { user_id: req.user.user_id }, order: [['added_at', 'DESC']] });
  res.json(books);
}

async function addBook(req, res) {
  const { title, author } = req.body;
  if (!title) return res.status(400).json({ message: 'Название книги обязательно' });

  const book = await Book.create({ user_id: req.user.user_id, title, author: author || null });
  await UserStats.increment('books_count', { where: { user_id: req.user.user_id } });

  res.status(201).json(book);
}

async function removeBook(req, res) {
  await Book.destroy({ where: { book_id: req.params.id, user_id: req.user.user_id } });
  await UserStats.decrement('books_count', { where: { user_id: req.user.user_id } });
  res.json({ message: 'Книга удалена' });
}

module.exports = { getMyBooks, addBook, removeBook };