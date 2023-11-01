import { Config } from 'jest';

export const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  rootDir: '../',
  clearMocks: true,
  testEnvironment: 'node',
  collectCoverageFrom: ['./src/*.ts', 'src/**/*.ts'],
  coveragePathIgnorePatterns: ['./src/server.ts', './src/app.ts'],
};

export default config;
