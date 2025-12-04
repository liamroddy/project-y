const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  watchman: false,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.mjs',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.mjs',
  },
};

module.exports = config;
