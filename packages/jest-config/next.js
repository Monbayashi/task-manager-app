const baseConfig = require("./base");

/**
 * apps/frontend用のjest-config
 *  @type {import('jest').Config}
 */
const nextConfig = {
  ...baseConfig,
  rootDir: "./",
  // カバレッジ範囲
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/**/*.test.ts",
    "!lib/**/*.spec.ts",
  ],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = nextConfig;
