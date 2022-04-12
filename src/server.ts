import dotenv from 'dotenv';
dotenv.config();

import ApiServer from './boundaries/api';
import AppDB from './boundaries/database';
import { MissingEnvironmentError } from './utilities/errors';

if (
  !process.env.DATABASE_HOST ||
  !process.env.DATABASE_NAME ||
  !process.env.DATABASE_USERNAME ||
  !process.env.DATABASE_PASSWORD ||
  !process.env.DATABASE_PORT
) {
  throw new MissingEnvironmentError('Database variables not present');
}
AppDB.connect({
  host: String(process.env.DATABASE_HOST),
  name: String(process.env.DATABASE_NAME),
  username: String(process.env.DATABASE_USERNAME),
  password: String(process.env.DATABASE_PASSWORD),
  port: Number(process.env.DATABASE_PORT),
}).then(() => {
  ApiServer.init();
  ApiServer.registerApiCatch();
  ApiServer.registerErrorHandler();

  if (!process.env.PORT) {
    throw new MissingEnvironmentError('Port not provided for API');
  }
  ApiServer.listen(Number(process.env.PORT));
});
