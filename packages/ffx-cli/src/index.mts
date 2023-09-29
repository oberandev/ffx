import * as p from "@clack/prompts";
import chalk from "chalk";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import * as Str from "fp-ts/lib/string.js";

import {
  ProjectCodec,
  copyOverTemplate,
  createProjectDirectory,
  createPackageJson,
} from "./lib/helpers.mjs";

async function main() {
  console.clear();

  p.intro(`${chalk.bgCyan(chalk.black(" @oberan/ffx-cli "))}`);

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
      template: ({ results }) => {
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
      pkgManager: () => {
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
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  pipe(
    ProjectCodec.decode(project),
    E.match(
      (decodeError) => console.error(JSON.stringify(decodeError)),
      (proj) => {
        const taskPipeline = pipe(
          createProjectDirectory(),
          // RTE.chain(() => copyOverTemplate()),
          RTE.chain(() => createPackageJson()),
          RTE.match(
            (err) => console.log(err),
            () => {
              const nextSteps = `cd ${proj.name}`;
              p.note(nextSteps, "Next steps.");

              p.outro(
                `Problems? ${chalk.underline(
                  chalk.cyan("https://github.com/oberandev/ffx/issues"),
                )}`,
              );
            },
          ),
        )(proj);

        taskPipeline();
      },
    ),
  );
}

main().catch(console.error);
