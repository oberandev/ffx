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
    files: ["packages/ffx-logger/**/*.mts", "packages/ffx-logger/**/*.ts"],
    rules: {},
  },
  {
    files: ["packages/ffx-logger/**/*.mts"],
    rules: {},
  },
  {
    files: ["packages/ffx-logger/**/*.ts"],
    rules: {},
  },
  ...compat.config({ parser: "jsonc-eslint-parser" }).map((config) => ({
    ...config,
    files: ["packages/ffx-logger/**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        { ignoredFiles: ["{projectRoot}/vite.config.{js,ts,mjs,mts}"] },
      ],
    },
  })),
];
