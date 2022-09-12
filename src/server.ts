import './boundaries/env';
import apiServer from './boundaries/api';
import Database from './boundaries/database';
import { MissingEnvironmentError } from './utilities/errors';
import { initAppDBModels } from './models';

if (
  !process.env.DATABASE_HOST ||
  !process.env.DATABASE_NAME ||
  !process.env.DATABASE_USERNAME ||
  !process.env.DATABASE_PASSWORD ||
  !process.env.DATABASE_PORT
) {
  throw new MissingEnvironmentError('Database variables not present');
}
const appDB = new Database({
  host: String(process.env.DATABASE_HOST),
  name: String(process.env.DATABASE_NAME),
  username: String(process.env.DATABASE_USERNAME),
  password: String(process.env.DATABASE_PASSWORD),
  port: Number(process.env.DATABASE_PORT),
});
appDB.connect(initAppDBModels).then(() => {
  apiServer.registerApiCatch();
  apiServer.registerErrorHandler();

  if (!process.env.PORT) {
    throw new MissingEnvironmentError('Port not provided for API');
  }
  apiServer.listen(Number(process.env.PORT));
});

export { appDB };
