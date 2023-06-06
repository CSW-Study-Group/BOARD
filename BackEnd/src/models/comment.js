'use strict';

const config = require('config');

const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
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
                comment: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                deleted_YN: {
                    type: Sequelize.ENUM('Y', 'N'),
                    allowNull: false,
                    defaultValue: 'N',
                }
            },
            {
                sequelize,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                modelName: 'Comment',
                tableName: 'post_comment',
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );
    }

    static associate(db) {
        db.Comment.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });
        db.Comment.belongsTo(db.Post, { foreignKey: 'post_id', targetKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });
    }
};
