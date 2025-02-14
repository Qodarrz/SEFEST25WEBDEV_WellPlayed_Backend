const sequelize = require("../config/database");
const User = require("./User");
const Community = require("./Community");
const Comment = require("./Comment");
const Emission = require("./Emisi"); // ✅ Import model Emission

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
Emission.belongsTo(User, { foreignKey: "user_id", as: "auth" });

module.exports = { sequelize, User, Community, Comment, Emission };
