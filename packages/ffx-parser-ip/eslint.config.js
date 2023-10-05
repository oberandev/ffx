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
    files: ["packages/ffx-parser-ip/**/*.{js,ts,mjs,mts}"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-ip/**/*.js"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-ip/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-ip/**/*.mjs"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-ip/**/*.mts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/ffx-parser-ip/**/*.json"],
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
