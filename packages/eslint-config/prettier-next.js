import base from "./prettier-base.js";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const prettierNest = {
  ...base,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^react$",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "^@repo/(.*)$",
    "^[./]",
  ],
  importOrderSortSpecifiers: true,
};

export default prettierNest;
