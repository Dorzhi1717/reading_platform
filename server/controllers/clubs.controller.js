const { Op } = require('sequelize');
const { BookClub, User, ClubMember, UserStats } = require('../models/models');

async function getAll(req, res) {
  try {
    const { search } = req.query;
    const where = {};
    if (search) where.club_name = { [Op.iLike]: `%${search}%` };

    const clubs = await BookClub.findAll({
      where,
      include: [{ model: User, attributes: ['username'] }],
      order: [['created_at', 'DESC']]
    });

    const result = await Promise.all(clubs.map(async (club) => {
      const count = await ClubMember.count({ where: { club_id: club.club_id } });
      return {
        club_id: club.club_id,
        club_name: club.club_name,
        description: club.description,
        creator_id: club.creator_id,
        creator_name: club.User?.username,
        member_count: count,
        created_at: club.created_at
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('getAll error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function getMy(req, res) {
  try {
    const memberships = await ClubMember.findAll({
      where: { user_id: req.user.user_id },
      include: [{ model: BookClub }]
    });

    const result = await Promise.all(memberships.map(async (m) => {
      const count = await ClubMember.count({ where: { club_id: m.club_id } });
      return { ...m.BookClub.toJSON(), user_role: m.role, member_count: count };
    }));

    res.json(result);
  } catch (err) {
    console.error('getMy error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const club = await BookClub.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }]
    });
    if (!club) return res.status(404).json({ message: 'Клуб не найден' });

    const members = await ClubMember.findAll({
      where: { club_id: club.club_id },
      include: [{ model: User, attributes: ['user_id', 'username'] }]
    });

    res.json({
      ...club.toJSON(),
      creator_name: club.User?.username,
      members: members.map(m => ({
        user_id: m.User.user_id,
        username: m.User.username,
        role: m.role,
        joined_at: m.joined_at
      }))
    });
  } catch (err) {
    console.error('getById error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { club_name, description } = req.body;
    if (!club_name) return res.status(400).json({ message: 'Название клуба обязательно' });

    const club = await BookClub.create({
      creator_id: req.user.user_id,
      club_name,
      description
    });

    await ClubMember.create({
      user_id: req.user.user_id,
      club_id: club.club_id,
      role: 'owner'
    });

    await UserStats.increment('clubs_count', { where: { user_id: req.user.user_id } });

    res.status(201).json(club);
  } catch (err) {
    console.error('create error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function join(req, res) {
  try {
    const exists = await ClubMember.findOne({
      where: { user_id: req.user.user_id, club_id: req.params.id }
    });
    if (exists) return res.status(400).json({ message: 'Вы уже в клубе' });

    await ClubMember.create({
      user_id: req.user.user_id,
      club_id: req.params.id
    });

    await UserStats.increment('clubs_count', { where: { user_id: req.user.user_id } });

    res.json({ message: 'Вы вступили в клуб' });
  } catch (err) {
    console.error('join error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function leave(req, res) {
  try {
    await ClubMember.destroy({
      where: { user_id: req.user.user_id, club_id: req.params.id }
    });

    await UserStats.decrement('clubs_count', { where: { user_id: req.user.user_id } });

    res.json({ message: 'Вы покинули клуб' });
  } catch (err) {
    console.error('leave error:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, getMy, getById, create, join, leave };