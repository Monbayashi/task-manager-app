const baseConfig = require("./base");

/**
 * apps/backend用のjest-config
 *  @type {import('jest').Config}
 */
const nestConfig = {
  ...baseConfig,
  rootDir: "./",
  // カバレッジ範囲
  collectCoverageFrom: [
    "./src/**/*.service.ts",
    "!./src/**/*.test.ts",
    "!./src/**/*.spec.ts",
  ],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
  },
};

module.exports = nestConfig;
