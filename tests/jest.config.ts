import { Config } from 'jest';

export const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  clearMocks: true,
  testEnvironment: 'node',
};

export default config;
