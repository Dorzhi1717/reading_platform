const { UserStats, Achievement, UserAchievement } = require('../models/models');

async function getStats(req, res) {
  const stats = await UserStats.findByPk(req.user.user_id);

  const earned = await UserAchievement.findAll({
    where: { user_id: req.user.user_id },
    include: [{ model: Achievement }]
  });

  const all = await Achievement.findAll();

  res.json({
    stats: stats || { books_count: 0, clubs_count: 0, messages_count: 0 },
    earned: earned.map(e => e.Achievement),
    all
  });
}

module.exports = { getStats };