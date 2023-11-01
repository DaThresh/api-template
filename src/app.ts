import { Boundaries, Server, environment } from './boundaries';
import { initModels } from './models';

export const createApp = async () => {
  await Boundaries.initialize(environment, initModels);

  const server = new Server();
  // Register handlers here
  server.registerApiCatch();
  server.registerErrorHandler();
  return { server };
};
