import config from '@repo/jest-config/internal-packages';
export default {
  ...config,
  collectCoverageFrom: [...config.collectCoverageFrom, '!**/index.ts', '!**/types.ts'],
};
