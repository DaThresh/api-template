module.exports = {
  extends: '../.eslintrc.js',
  globals: {
    jest: 'readonly',
    expect: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    beforeEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    afterEach: 'readonly',
  },
  ignorePatterns: [],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
};
