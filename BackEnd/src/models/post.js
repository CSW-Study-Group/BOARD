'use strict';

const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    allowNull: false,
                    unique: true,
                    primaryKey: true,
                },
                title: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                view: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                recommand: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                    updated_at: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: null,
                    updated_at: false
                }
            },
            {
                sequelize,
                timestamps: false,
                paranoid: true,
                modelName: 'Post',
                tableName: 'postinfo',
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    }

    static associate(db) {
        db.Post.belongsTo(db.User, { foreignKey: 'userkey', targetKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });
        db.Post.belongsToMany(db.User, { through: 'user_post' });
    }
};
