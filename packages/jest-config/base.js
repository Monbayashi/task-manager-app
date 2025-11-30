/** @type {import('jest').Config} */
const baseConfig = {
  moduleFileExtensions: ["js", "ts", "json"],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [],
  coverageProvider: "v8",
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/"],
  testRegex: [".*\\.spec\\.(t|j)s$", ".*\\.test\\.(t|j)s$"],
  transform: { "^.+\\.(t|j)s$": "ts-jest" },

  moduleNameMapper: {
    "^@repo/types$": "<rootDir>/../../packages/types/src",
  },
};

module.exports = baseConfig;
