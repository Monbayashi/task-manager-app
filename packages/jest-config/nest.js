const baseConfig = require("./base");

/**
 * apps/backend用のjest-config
 *  @type {import('jest').Config}
 */
const nestConfig = {
  ...baseConfig,
  rootDir: "./src",
  // カバレッジ範囲
  collectCoverageFrom: ["**/*.service.ts", "!**/*.test.ts", "!**/*.spec.ts"],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
  },
};

module.exports = nestConfig;
