const sequelize = require('../db')
const { DataTypes } = require('sequelize')

sequelize.options.define.timestamps = false;

const User = sequelize.define('User', {
  user_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  username: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true 
  },
  email: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true 
  },
  password_hash: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  role: { 
    type: DataTypes.STRING(20), 
    defaultValue: 'student' 
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false,
  freezeTableName: true
});

const Book = sequelize.define('Book', {
  book_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  author: { type: DataTypes.STRING(255) },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'books',
  timestamps: false
})

const BookClub = sequelize.define('BookClub', {
  club_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  creator_id: { type: DataTypes.INTEGER, allowNull: false },
  club_name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'book_clubs',
  timestamps: false
})

const ClubMember = sequelize.define('ClubMember', {
  membership_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  club_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING(20), defaultValue: 'member' },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'club_members',
  timestamps: false
})

const TextMessage = sequelize.define('TextMessage', {
  message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  club_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'text_messages',
  timestamps: false
})

const VoiceMessage = sequelize.define('VoiceMessage', {
  voice_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  club_id: { type: DataTypes.INTEGER, allowNull: false },
  audio_path: { type: DataTypes.STRING(255), allowNull: false },
  transcript: { type: DataTypes.TEXT, allowNull: true },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'voice_messages',
  timestamps: false
});

const UserStats = sequelize.define('UserStats', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  books_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  clubs_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  messages_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'user_stats',
  timestamps: false
});

const Achievement = sequelize.define('Achievement', {
  achievement_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT }
}, {
  tableName: 'achievements',
  timestamps: false
})

const UserAchievement = sequelize.define('UserAchievement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  achievement_id: { type: DataTypes.INTEGER, allowNull: false },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_achievements',
  timestamps: false
})

// Книги
User.hasMany(Book, { foreignKey: 'user_id' })
Book.belongsTo(User, { foreignKey: 'user_id' })

// Клубы
User.hasMany(BookClub, { foreignKey: 'creator_id' })
BookClub.belongsTo(User, { foreignKey: 'creator_id' })

// Участники клубов
User.hasMany(ClubMember, { foreignKey: 'user_id' })
ClubMember.belongsTo(User, { foreignKey: 'user_id' })

BookClub.hasMany(ClubMember, { foreignKey: 'club_id' })
ClubMember.belongsTo(BookClub, { foreignKey: 'club_id' })

// Сообщения
User.hasMany(TextMessage, { foreignKey: 'user_id' })
TextMessage.belongsTo(User, { foreignKey: 'user_id' })

BookClub.hasMany(TextMessage, { foreignKey: 'club_id' })
TextMessage.belongsTo(BookClub, { foreignKey: 'club_id' })

// Голосовые
User.hasMany(VoiceMessage, { foreignKey: 'user_id' })
VoiceMessage.belongsTo(User, { foreignKey: 'user_id' })

BookClub.hasMany(VoiceMessage, { foreignKey: 'club_id' })
VoiceMessage.belongsTo(BookClub, { foreignKey: 'club_id' })

// Статистика
User.hasOne(UserStats, { foreignKey: 'user_id' })
UserStats.belongsTo(User, { foreignKey: 'user_id', constraints: false })

// Достижения
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'user_id' })
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievement_id' })

module.exports = {
  User,
  Book,
  BookClub,
  ClubMember,
  TextMessage,
  VoiceMessage,
  UserStats,
  Achievement,
  UserAchievement
};