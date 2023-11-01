import process from 'process';
import { Boundaries, Server, environment } from './boundaries';
import { initModels } from './models';
import { gracefulShutdown } from './utilities/shutdown';

export const createApp = async () => {
  await Boundaries.initialize(environment, initModels);
  const server = new Server();

  process.on('SIGINT', () => gracefulShutdown(server, Boundaries.Database));
  return { server };
};
