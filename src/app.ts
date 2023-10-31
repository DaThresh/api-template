import Database from './boundaries/database';
import { environment } from './boundaries/environment';
import { Server } from './boundaries/server';
import { initModels } from './models';

export let database: Database;

export const createApp = async () => {
  database = await Database.initialize(environment.database, initModels);

  const server = new Server();
  // Register handlers here
  server.registerApiCatch();
  server.registerErrorHandler();
  return { server };
};
