import * as p from "@clack/prompts";
import chalk from "chalk";
import * as Str from "fp-ts/string";

async function main() {
  console.clear();

  p.intro(`${chalk.bgCyan(chalk.black(" ffx-cli "))}`);

  const project = await p.group(
    {
      name: () => {
        return p.text({
          message: "What should we name your project?",
          placeholder: "ffx-starter",
          validate: (value) => {
            if (Str.isEmpty(Str.trim(value))) {
              return "Please enter a project name.";
            }

            return;
          },
        });
      },
      type: ({ results }) => {
        return p.select({
          message: `Pick a project type for ${chalk.blue.bold(results.name)}.`,
          initialValue: "ts",
          maxItems: 5,
          options: [
            { value: "ts", label: "TypeScript" },
            { value: "js", label: "JavaScript", hint: "oh no" },
          ],
        });
      },
      tools: () => {
        return p.multiselect({
          message: "Select additional tools.",
          initialValues: ["prettier", "eslint"],
          options: [
            { value: "prettier", label: "Prettier", hint: "recommended" },
            { value: "eslint", label: "ESLint", hint: "recommended" },
            { value: "husky", label: "Husky", hint: "recommended" },
          ],
          required: false,
        });
      },
      unitTestRunner: () => {
        return p.select({
          message: "What unit test runner should we use?",
          initialValue: "vitest",
          maxItems: 5,
          options: [
            { value: "vitest", label: "vitest", hint: "recommended" },
            { value: "jest", label: "jest" },
          ],
        });
      },
      packageManager: () => {
        return p.select({
          message: "What package manager should we use?",
          initialValue: "pnpm",
          maxItems: 5,
          options: [
            { value: "pnpm", label: "pnpm", hint: "recommended" },
            { value: "npm", label: "npm" },
            { value: "yarn", label: "yarn" },
          ],
        });
      },
      envManager: () => {
        return p.select({
          message: "What environment manager should we use?",
          initialValue: "nvm",
          maxItems: 5,
          options: [
            { value: "nvm", label: "Node Version Manager (nvm)" },
            { value: "volta", label: "Volta" },
            { value: "nix", label: "Nix" },
          ],
        });
      },
      install: () => {
        return p.confirm({
          message: "Install dependencies?",
          initialValue: true,
        });
      },
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  let nextSteps = `cd ${project.name}        \n${project.install ? "" : "pnpm install\n"}pnpm dev`;

  p.note(nextSteps, "Next steps.");

  p.outro(`Problems? ${chalk.underline(chalk.cyan("https://github.com/oberandev/ffx/issues"))}`);
}

main().catch(console.error);
