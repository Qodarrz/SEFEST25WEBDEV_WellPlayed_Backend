const sequelize = require("../config/database");
const User = require("./User");
const Community = require("./Community");
const Comment = require("./Comment");

// 🔗 Relasi User ke Community (Post) ✅ Fix alias
User.hasMany(Community, { foreignKey: "user_id", as: "posts" });
Community.belongsTo(User, { foreignKey: "user_id", as: "author" }); // ✅ Ubah alias ke "user"

/// 🔗 Relasi Community ke Comment
Community.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Community, { foreignKey: "post_id", as: "post" });

// 🔗 Relasi User ke Comment
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "commenter" });

// 🔗 Relasi untuk nested replies
Comment.hasMany(Comment, { foreignKey: "parent_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_id", as: "parent" });

module.exports = { sequelize, User, Community, Comment };
