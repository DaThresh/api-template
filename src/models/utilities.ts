import { DataTypes, Model, ModelAttributeColumnOptions, ModelStatic } from 'sequelize';

export type Nullable<Type> = Type | null;

export const primaryKeyModelAttributes: ModelAttributeColumnOptions = {
  type: DataTypes.INTEGER.UNSIGNED,
  primaryKey: true,
  autoIncrement: true,
  allowNull: false,
};

export const foreignKeyModelAttributes = (
  allowNull: boolean,
  model?: ModelStatic<Model>
): ModelAttributeColumnOptions => ({
  ...(model ? { references: { model } } : {}),
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull,
});
