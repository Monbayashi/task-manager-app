/**
 * backend e2e用のjest-config
 *  @type {import('jest').Config}
 */
const nestE2EConfig = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "./",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  transformIgnorePatterns: [],
  // カバレッジ範囲
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "json-summary", "text"],
  coverageProvider: "v8",
  testEnvironment: "node",
  collectCoverageFrom: [
    "./src/**/*.ts",
    "!./src/**/*.test.ts",
    "!./src/**/*.spec.ts",
    "!./src/**/*.spec.ts",
    "!./src/**/*.dto.ts",
    "!./src/common/config/*.ts",
    "!./src/common/logger/*.ts",
    "!./src/database/dynamodb/dynamo-client.service.ts",
    "!./src/types/*.d.ts",
    "!./src/**/types.ts",
    "!./src/main.ts",
  ],
};

module.exports = nestE2EConfig;
