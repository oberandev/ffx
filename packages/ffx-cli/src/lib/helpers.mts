import { $ } from "execa";
import * as E from "fp-ts/Either";
import { constVoid, pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { URL } from "node:url";
import { match } from "ts-pattern";

export const ProjectCodec = t.type({
  name: t.string,
  template: t.union([t.literal("js"), t.literal("ts")]),
  unitTestRunner: t.union([t.literal("jest"), t.literal("vitest")]),
  pkgManager: t.union([t.literal("npm"), t.literal("pnpm"), t.literal("yarn")]),
  envManager: t.union([t.literal("nix"), t.literal("nvm"), t.literal("volta")]),
});

export type Project = t.TypeOf<typeof ProjectCodec>;

export function createProjectDirectory(): RTE.ReaderTaskEither<Project, string, void> {
  return pipe(
    RTE.ask<Project>(),
    RTE.chainTaskEitherK((project) => {
      return TE.tryCatch(
        () => fs.mkdir(project.name),
        (err: unknown) => JSON.stringify(err), // {"errno":-17,"code":"EEXIST","syscall":"mkdir","path":"unicorns"}
      );
    }),
  );
}

export function copyOverTemplate(): RTE.ReaderTaskEither<Project, string, void> {
  // const src: URL = new URL(
  //   "/template",
  //   "https://github.com/facebook/create-react-app/tree/main/packages/cra-template-typescript/",
  // );

  return pipe(
    RTE.ask<Project>(),
    RTE.chainTaskEitherK((project) => {
      return TE.tryCatch(
        () => fs.cp(`./templates/${project.template}`, `.${project.name}`, { recursive: true }),
        (err: unknown) => JSON.stringify(err), // {"code":"ERR_FS_CP_NON_DIR_TO_DIR","info":{"message":"cannot overwrite non-directory eslint.config.js with directory ./unicorns","path":"./unicorns","syscall":"cp","errno":20,"code":"ENOTDIR"},"errno":20,"syscall":"cp","path":"./unicorns"}
      );
    }),
    // remove `.template` from all filenames
  );
}

export function createPackageJson(): RTE.ReaderTaskEither<Project, string, void> {
  return pipe(
    RTE.ask<Project>(),
    RTE.chainTaskEitherK((project) => {
      return TE.tryCatch(
        () => {
          const packageJson: J.Json = {
            name: project.name,
            version: "0.0.0",
            private: true,
            engines: {
              node: ">= 18",
            },
            type: "module",
            module: "./src/index.mts",
            main: "./src/index.mts",
            scripts: {
              build:
                "esbuild src/main.ts --bundle --platform=node --target=node18 --minify --outdir=dist --out-extension:.js=.min.cjs",
              clean: "rimraf ./dist",
              compile: "tsc",
              format: "prettier --write '{src,test}/**/*.{js,ts,mjs,mts}'",
              lint: "eslint '{src,test}/**/*.{js,ts,mjs,mts}'",
              "lint:fix": "eslint '{src,test}/**/*.{js,ts,mjs,mts}' --fix",
              prepare: "is-ci || husky install",
            },
            dependencies: {},
            devDependencies: {},
            "lint-staged": {
              "**/*.{json,md}": ["prettier --write"],
              "**/*.{js,mjs,mts,ts}": ["eslint --fix", "prettier --write"],
            },
          };

          return pipe(
            J.stringify(JSON.stringify(packageJson, null, 2) + os.EOL),
            E.match(
              (err: unknown) => {
                if (err instanceof Error) {
                  return Promise.reject(err.message);
                } else {
                  return Promise.reject("Unknown error stringifying JSON");
                }
              },
              (stringified) => {
                return fs.writeFile(`./${project.name}/package.json`, stringified);
              },
            ),
          );
        },
        (err: unknown) => JSON.stringify(err),
      );
    }),
  );

  // {"errno":-17,"code":"EEXIST","syscall":"mkdir","path":"unicorns"}
  // {"errno":-21,"code":"EISDIR","syscall":"open","path":"./unicorns"}
}

export function installDependencies(): RTE.ReaderTaskEither<Project, string, void> {
  return pipe(
    RTE.ask<Project>(),
    RTE.chainTaskEitherK((project) => {
      const devDependencies = [
        "@eslint/eslintrc",
        "@types/node",
        "esbuild",
        "eslint",
        "eslint-config-prettier",
        "eslint-plugin-import",
        "husky",
        "is-ci",
        "lint-staged",
        "prettier",
        ...(project.template === "ts"
          ? ["@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", "typescript"]
          : []),
        ...(project.unitTestRunner === "jest" ? ["jest"] : []),
        ...(project.unitTestRunner === "vitest"
          ? ["@vitest/coverage-v8", "@vitest/ui", "vite", "vitest"]
          : []),
        "rimraf",
      ];

      return pipe(
        TE.tryCatch(
          () => {
            return match(project.pkgManager)
              .with("npm", () => $`npm install ${devDependencies.join(" ")} --save-dev`)
              .with("pnpm", () => $`pnpm install ${devDependencies.join(" ")} --save-dev`)
              .with("yarn", () => $`yarn install ${devDependencies.join(" ")} --dev`)
              .exhaustive();
          },
          (err: unknown) => JSON.stringify(err),
        ),
        TE.map(constVoid),
      );
    }),
  );
}

// export function clone(): TE.TaskEither<string, void> {
//   return TE.tryCatch(
//     () => execa("git", ["clone", ""]),
//     () => "clone error",
//   );
// }

// copy over template directory
// rename all file to not have `.template`

// OR
// use execa to git clone repository to local cache then copy
