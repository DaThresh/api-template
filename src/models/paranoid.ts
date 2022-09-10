import { InitOptions, Model, Sequelize } from 'sequelize';

class ParanoidModel<Data extends Record<string, unknown>, CreationData> extends Model<
  Data,
  Omit<CreationData, 'createdAt' | 'updatedAt'>
> {
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  public static initOptions = (connection: Sequelize): Partial<InitOptions> => ({
    sequelize: connection,
    timestamps: true,
    paranoid: true,
  });
}

export default ParanoidModel;
