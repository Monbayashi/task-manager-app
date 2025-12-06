const baseConfig = require("./base");

/**
 * 内部packages用のjest-config (ESM)
 * @type {import('jest').Config}
 * */
const internalPackageConfig = {
  ...baseConfig,
  rootDir: "./",
  // カバレッジ範囲
  collectCoverageFrom: [
    "./src/**/*.ts",
    "!./src/**/*.test.ts",
    "!./src/**/*.spec.ts",
  ],
  preset: "ts-jest/presets/default-esm",
};

module.exports = internalPackageConfig;
