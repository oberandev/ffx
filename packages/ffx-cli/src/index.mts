import mkClient from "@ffx/api";
import chalk from "chalk";
import { Command } from "commander";
import "dotenv";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";
import * as fs from "node:fs/promises";
import path from "node:path";
import { match } from "ts-pattern";
// import ora from "ora";

import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports

const PublishOptsCodec = t.intersection([
  t.type({
    file: t.string,
  }),
  t.partial({
    debug: t.boolean,
  }),
]);

function main() {
  const program = new Command();

  program.name("ffx").description("CLI to do magic").version(pkgJson.version);

  program
    .command("publish")
    .description("Publish your code")
    .requiredOption("-f, --file <FILE_PATH>", "file path to bundler output")
    .option("-d, --debug", "display some debugging")
    .action(async (options) => {
      pipe(
        PublishOptsCodec.decode(options),
        E.match(
          (err) => {
            console.error(formatValidationErrors(err));
            process.exit(1);
          },
          async (opts) => {
            const secret: string = process.env["FF_SECRET"] ?? "";
            const environmentId: string = process.env["FF_ENVIRONMENT_ID"] ?? "";
            const client = mkClient(secret, environmentId);

            console.log(`\n${chalk.bgCyan(chalk.black(" ffx "))}\n`);

            await client.environments.get(environmentId).then((resp) => {
              match(resp)
                .with({ _tag: "successful" }, ({ data: env }) => {
                  console.log(chalk.green("Using environment:\n"));
                  console.log(chalk.bgCyan(chalk.black(env.id)));
                })
                .otherwise((err) => {
                  console.error(chalk.red(JSON.stringify(err, null, 2)));
                  process.exit(1);
                });
            });

            console.log(`${chalk.green("Deploying agent...")}`);

            const fileContent: string = await fs
              .readFile(path.resolve(opts.file), {
                encoding: "utf-8",
              })
              .then((content) => content)
              .catch((err) => {
                console.error(chalk.red(JSON.stringify(err, null, 2)));
                process.exit(1);
              });

            await client.agents
              .create({
                compiler: "js",
                source: fileContent,
                topics: [],
              })
              .then((resp) => {
                match(resp)
                  .with({ _tag: "successful" }, ({ data: agent }) => {
                    console.log(JSON.stringify(agent, null, 2));
                  })
                  .otherwise((err) => {
                    console.error(chalk.red(JSON.stringify(err, null, 2)));
                    process.exit(1);
                  });
              });

            console.log(`${chalk.green("🎉 Success!")}`);
          },
        ),
      );
    });

  program.parse();
}

main();
