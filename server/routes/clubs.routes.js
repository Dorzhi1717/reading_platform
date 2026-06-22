const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getAll, getMy, getById, create, join, leave } = require('../controllers/clubs.controller');

router.get('/', authenticate, getAll);
router.get('/my', authenticate, getMy);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, create);
router.post('/:id/join', authenticate, join);
router.delete('/:id/leave', authenticate, leave);

module.exports = router;