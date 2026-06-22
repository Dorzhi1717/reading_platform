const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMyBooks, addBook, removeBook } = require('../controllers/books.controller');

router.get('/', authenticate, getMyBooks);
router.post('/', authenticate, addBook);
router.delete('/:id', authenticate, removeBook);

module.exports = router;