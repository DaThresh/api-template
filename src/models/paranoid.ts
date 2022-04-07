import { InitOptions, Model } from 'sequelize';

class ParanoidModel<Data, CreationData> extends Model<
  Data,
  Omit<CreationData, 'createdAt' | 'updatedAt'>
> {
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  public static initOptions = (): Partial<InitOptions> => ({
    timestamps: true,
    paranoid: true,
  });
}

export default ParanoidModel;
