import { DataTypes, Model } from 'sequelize';
import { foreignKeyModelAttributes } from '../../src/models/utilities';

describe('Model Utilities', () => {
  describe('Foreign Key Model Attributes', () => {
    class TestModel extends Model {}

    test('Will provide attributes with an Unsigned Integer', () => {
      const columnAttributes = foreignKeyModelAttributes(true);
      expect(columnAttributes).toMatchObject({ type: DataTypes.INTEGER.UNSIGNED });
    });

    test('Will add references Model if provided', () => {
      const columnAttributes = foreignKeyModelAttributes(true, TestModel);
      expect(columnAttributes).toMatchObject({ references: { model: TestModel } });
    });

    test.each([true, false])('Will return attributes with the correct nullable value', (value) => {
      const columnAttributes = foreignKeyModelAttributes(value);
      expect(columnAttributes).toMatchObject({ allowNull: value });
    });
  });
});
