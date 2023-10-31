import Database from './boundaries/database';
import './boundaries/environment';
import { environment } from './boundaries/environment';
import { Server } from './boundaries/server';
import { initAppDBModels } from './models';

const appDB = new Database(environment.database);
appDB.connect(initAppDBModels).then(() => {
  const server = new Server();
  // Register handlers here
  server.registerApiCatch();
  server.registerErrorHandler();

  server.listen(environment.port);
});

export { appDB };
