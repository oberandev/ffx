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
    files: ["packages/ffx-parser-isbn/**/*.{js,ts,mjs,mts}"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-isbn/**/*.js"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-isbn/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-isbn/**/*.mjs"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-isbn/**/*.mts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/ffx-parser-isbn/**/*.json"],
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
