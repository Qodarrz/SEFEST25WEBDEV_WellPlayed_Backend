const sequelize = require("../config/database");
const User = require("./User");
const Community = require("./Community");
const CommunityLike = require("./CommunityLike"); 
const Comment = require("./Comment");
const Emission = require("./Emisi"); 
const Achievement = require("./Achievement"); 
const Mission = require("./Mission");
const UserMission = require("./UserMission"); // ✅ Pastikan nama sesuai

// 🔗 Relasi User ke Community (Post)
User.hasMany(Community, { foreignKey: "user_id", as: "posts" });
Community.belongsTo(User, { foreignKey: "user_id", as: "author" });

// 🔗 Relasi Community ke Comment
Community.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Community, { foreignKey: "post_id", as: "post" });

// 🔗 Relasi User ke Comment
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "commenter" });

// 🔗 Relasi Comment ke Comment (Reply System)
Comment.hasMany(Comment, { foreignKey: "parent_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_id", as: "parent" });

// 🔗 Relasi User ke Emission
User.hasMany(Emission, { foreignKey: "user_id", onDelete: "CASCADE", as: "emissions" });
Emission.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 🔗 Relasi User ke CommunityLike
User.hasMany(CommunityLike, { foreignKey: "user_id", as: "community_likes" });
CommunityLike.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 🔗 Relasi Community ke CommunityLike
Community.hasMany(CommunityLike, { foreignKey: "post_id", as: "community_likes" });
CommunityLike.belongsTo(Community, { foreignKey: "post_id", as: "community" });

// 🔗 Relasi User ke Achievement
User.hasMany(Achievement, { foreignKey: "user_id", as: "achievements" });
Achievement.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 🔗 Relasi User ke Mission (MELALUI UserMission)
User.belongsToMany(Mission, { through: UserMission, foreignKey: "user_id" });
Mission.belongsToMany(User, { through: UserMission, foreignKey: "mission_id" });

UserMission.belongsTo(User, { foreignKey: "user_id" });
UserMission.belongsTo(Mission, { foreignKey: "mission_id" });

// ✅ Export semua model
module.exports = { sequelize, User, Community, Comment, Emission, CommunityLike, Achievement, Mission, UserMission };
