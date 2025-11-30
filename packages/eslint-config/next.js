import { defineConfig, globalIgnores } from "eslint/config";
import { config as baseConfig } from "./base.js";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = defineConfig([
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  prettierRecommended,
  // prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
