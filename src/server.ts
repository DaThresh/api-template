import dotenv from 'dotenv';
dotenv.config();

import ApiServer from './boundaries/api';
import AppDB from './boundaries/database';
import { MissingEnvironmentError } from './utilities/errors';

if (
  !process.env.databaseHost ||
  !process.env.databaseName ||
  !process.env.databaseUsername ||
  !process.env.databasePassword ||
  !process.env.databasePort
) {
  throw new MissingEnvironmentError('Database variables not present');
}
AppDB.connect({
  host: String(process.env.databaseHost),
  name: String(process.env.databaseName),
  username: String(process.env.databaseUsername),
  password: String(process.env.databasePassword),
  port: Number(process.env.databasePort),
});

ApiServer.init();
ApiServer.registerApiCatch();
ApiServer.registerErrorHandler();
ApiServer.listen(8000);
