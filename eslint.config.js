const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const nxEslintPlugin = require("@nx/eslint-plugin");
const eslintPluginImport = require("eslint-plugin-import");
const tsDocPlugin = require("eslint-plugin-tsdoc");

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
    files: ["**/*.{js,ts,mjs,mts}"],
    rules: {
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-cycle": "error",
      "import/no-relative-parent-imports": "error",
      "import/no-self-import": "error",
      "import/order": [
        "error",
        {
          groups: [["builtin", "external", "internal"], ["sibling", "parent"], ["index"]],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
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
  ...compat.config({ extends: ["plugin:@nx/javascript"] }).map((config) => ({
    ...config,
    files: ["**/*.js"],
    rules: {},
  })),
  ...compat.config({ extends: ["plugin:@nx/typescript"] }).map((config) => ({
    ...config,
    files: ["**/*.ts"],
    rules: {},
  })),
  ...compat.config({ extends: ["plugin:@nx/javascript"] }).map((config) => ({
    ...config,
    files: ["**/*.mjs"],
    rules: {},
  })),
  ...compat.config({ extends: ["plugin:@nx/typescript"] }).map((config) => ({
    ...config,
    files: ["**/*.mts"],
    rules: {},
  })),
];
