import apiServer from './boundaries/api';
import Database from './boundaries/database';
import './boundaries/environment';
import { environment } from './boundaries/environment';
import { initAppDBModels } from './models';

const appDB = new Database(environment.database);
appDB.connect(initAppDBModels).then(() => {
  // Register handlers here
  apiServer.registerApiCatch();
  apiServer.registerErrorHandler();

  apiServer.listen(environment.port);
});

export { appDB };
