const { FlatCompat } = require("@eslint/eslintrc");
const nxEslintPlugin = require("@nx/eslint-plugin");
const eslintPluginImport = require("eslint-plugin-import");
const tsDocPlugin = require("eslint-plugin-tsdoc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    plugins: {
      "@nx": nxEslintPlugin,
      import: eslintPluginImport,
      tsdoc: tsDocPlugin,
    },
  },
  {
    files: ["**/*.mts", "**/*.ts"],
    rules: {
      "import/newline-after-import": "error",
      "import/no-cycle": "error",
      "import/no-relative-parent-imports": "error",
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
      "tsdoc/syntax": "warn",
    },
  },
  ...compat.config({ extends: ["plugin:@nx/typescript"] }).map((config) => ({
    ...config,
    files: ["**/*.mts"],
    rules: {},
  })),
  ...compat.config({ extends: ["plugin:@nx/javascript"] }).map((config) => ({
    ...config,
    files: ["**/*.ts"],
    rules: {},
  })),
];
