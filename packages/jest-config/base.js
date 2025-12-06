/** @type {import('jest').Config} */
const baseConfig = {
  moduleFileExtensions: ["js", "ts", "json"],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "json-summary", "text"],
  coverageProvider: "v8",
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/"],
  testRegex: [".*\\.spec\\.(t|j)s$", ".*\\.test\\.(t|j)s$"],
  transform: { "^.+\\.(t|j)s$": "ts-jest" },

  moduleNameMapper: {
    "^@repo/api-models$": "<rootDir>/../../packages/api-models/src",
  },
};

module.exports = baseConfig;
