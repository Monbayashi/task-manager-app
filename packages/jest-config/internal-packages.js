const baseConfig = require("./base");

/**
 * 内部packages用のjest-config (ESM)
 * @type {import('jest').Config}
 * */
const internalPackageConfig = {
  ...baseConfig,
  rootDir: "./src",
  // カバレッジ範囲
  collectCoverageFrom: ["**/*.ts", "!**/*.test.ts", "!**/*.spec.ts"],
  preset: "ts-jest/presets/default-esm",
};

module.exports = internalPackageConfig;
