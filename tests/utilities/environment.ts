import { Environment } from '../../src/boundaries';

export const sampleEnvironment: Environment = {
  port: 8080,
  appName: 'Sample App',
  auth0: { tenantDomain: 'https://test.auth0.com' },
  database: {
    host: 'localhost',
    port: 3306,
    name: 'database',
    username: 'username',
    password: 'password',
  },
};
