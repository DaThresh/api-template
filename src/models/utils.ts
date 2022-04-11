import { DataTypes } from 'sequelize';

export const primaryKeyModelAttributes = {
  type: DataTypes.INTEGER.UNSIGNED,
  primaryKey: true,
  autoIncrement: true,
  allowNull: false,
  unique: true,
};

export const foreignKeyModelAttributes = {
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: false,
};
