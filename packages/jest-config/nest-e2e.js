/**
 * backend e2e用のjest-config
 *  @type {import('jest').Config}
 */
const nestE2EConfig = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "<rootDir>/test",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};

module.exports = nestE2EConfig;
