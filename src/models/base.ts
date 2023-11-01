import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  InitOptions,
  Model,
  ModelAttributes,
  Sequelize,
  ValidationError,
} from 'sequelize';
import { Nullable } from './utilities';

export abstract class AuditModel<Attributes = object, CreationAttributes = object> extends Model<
  InferAttributes<AuditModel> & Attributes,
  InferCreationAttributes<AuditModel> & CreationAttributes
> {
  declare readonly createdBy: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare updatedBy: Nullable<string>;
  declare updatedAt: Nullable<Date>;

  protected static attributes: ModelAttributes<AuditModel, InferAttributes<AuditModel>> = {
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      validate: { isEmail: true },
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };

  protected static initOptions(connection: Sequelize): InitOptions {
    return {
      sequelize: connection,
      timestamps: true,
      validate: {
        createdByNoUpdate(this: AuditModel) {
          if (!this.isNewRecord && this.changed('createdBy')) {
            throw new ValidationError(`Cannot update Created By after creation`, []);
          }
        },
      },
    };
  }

  // Must have Unused Var for proper inheritance
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static initModel(_: Sequelize) {
    throw new Error(`Must define static initModel in ${this.name} Class`);
  }

  public static associate() {
    // Override in each model
  }
}

export abstract class ParanoidAuditModel<
  Attributes = object,
  CreationAttributes = object,
> extends AuditModel<
  InferAttributes<ParanoidAuditModel> & Attributes,
  InferCreationAttributes<ParanoidAuditModel> & CreationAttributes
> {
  declare deletedAt: Nullable<Date>;
  declare deletedBy: Nullable<string>;

  protected static attributes: ModelAttributes<
    ParanoidAuditModel,
    InferAttributes<ParanoidAuditModel>
  > = {
    ...AuditModel.attributes,
    deletedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      validate: { isEmail: true },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };

  protected static initOptions(connection: Sequelize): InitOptions {
    const auditInitOptions = AuditModel.initOptions(connection);
    return {
      ...auditInitOptions,
      paranoid: true,
      validate: {
        ...auditInitOptions.validate,
        deletedByEnforce(this: ParanoidAuditModel) {
          if (this.deletedAt && !this.deletedBy) {
            throw new ValidationError(`Must provide a Destroyer`, []);
          }
        },
      },
    };
  }
}
