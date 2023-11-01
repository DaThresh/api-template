import { InferAttributes, InferCreationAttributes, Sequelize, ValidationError } from 'sequelize';
import { Boundaries, environment } from '../../src/boundaries';
import { ParanoidAuditModel } from '../../src/models/base';

class TestModel extends ParanoidAuditModel<
  InferAttributes<TestModel>,
  InferCreationAttributes<TestModel>
> {}

beforeAll(async () => {
  await Boundaries.initialize(environment, (connection) =>
    TestModel.init(ParanoidAuditModel['attributes'], ParanoidAuditModel['initOptions'](connection))
  );
});

afterAll(async () => {
  await Boundaries.Database.close();
});

describe('Base Models', () => {
  describe('Audit Model', () => {
    test('Will auto-assign a Created At timestamp', () => {
      const instance = TestModel.build({ createdBy: 'email@domain.com' });
      expect(instance.createdAt).toBeInstanceOf(Date);
    });

    test('Will throw an Error if initModel has not been reimplemented', () => {
      expect(() => TestModel.initModel(new Sequelize())).toThrow(Error);
    });

    test('Will not allow a non-email in Audit fields', async () => {
      const instance = TestModel.build({ createdBy: 'not-email', updatedBy: 'not-email' });
      await expect(instance.validate()).rejects.toThrow(ValidationError);
    });

    test('Will not allow reassignment to Created By Field', async () => {
      const instance = TestModel.build({ createdBy: 'email@domain.com' });
      instance.isNewRecord = false;
      await expect(instance.validate()).rejects.toThrow(ValidationError);
    });
  });

  describe('Paranoid Audit Model', () => {
    test('Waill not allow a non-email in Deleted By Field', async () => {
      const instance = TestModel.build({
        createdBy: 'email@domain.com',
        deletedAt: new Date(),
        deletedBy: 'not-email',
      });
      await expect(instance.validate()).rejects.toThrow(ValidationError);
    });

    test('Will enforce a Deleted By to be present with a Deleted At', async () => {
      const instance = TestModel.build({ createdBy: 'email@domain.com', deletedAt: new Date() });
      await expect(instance.validate()).rejects.toThrow(ValidationError);
    });
  });
});
