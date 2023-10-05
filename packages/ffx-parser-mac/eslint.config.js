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
    files: ["packages/ffx-parser-mac/**/*.{js,ts,mjs,mts}"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-mac/**/*.js"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-mac/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-mac/**/*.mjs"],
    rules: {},
  },
  {
    files: ["packages/ffx-parser-mac/**/*.mts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/ffx-parser-mac/**/*.json"],
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
