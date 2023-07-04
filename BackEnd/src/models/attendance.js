'use strict';

const Sequelize = require('sequelize');

module.exports = class Attendance extends Sequelize.Model {
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
        attendance_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'Attendance',
        tableName: 'attendance_info',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
    );
  }

  static associate(db) {
    db.Attendance.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  }
};
