const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const baseConfig = require("../../eslint.config.js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...baseConfig,
  {
    files: ["packages/address-geocodio/**/*.mts", "packages/address-geocodio/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/address-geocodio/**/*.mts"],
    rules: {},
  },
  {
    files: ["packages/address-geocodio/**/*.ts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/address-geocodio/**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/vite.config.{js,ts,mjs,mts}"] },
      ],
    },
  })),
];
