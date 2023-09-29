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
    files: ["packages/ffx-guards/**/*.{js,ts,mjs,mts}"],
    rules: {},
  },
  {
    files: ["packages/ffx-guards/**/*.js"],
    rules: {},
  },
  {
    files: ["packages/ffx-guards/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/ffx-guards/**/*.mjs"],
    rules: {},
  },
  {
    files: ["packages/ffx-guards/**/*.mts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/ffx-guards/**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: ["{projectRoot}/vite.config.{js,ts,mjs,mts}"],
        },
      ],
    },
  })),
];
