# @oberan/ffx-cli

A small, lightweight CLI for managing deployments of Flatfile configuration.

## What are the differences?

`@flatfile/cli`

- Bundles your code for you leaving no way to overwrite configuration should something go awry.
- Uses `@flatfile/api` under-the-hood.
- Prints only info and error logs (mostly cryptic).

`@oberan/ffx-cli`

- Does not attempt to bundle your code allowing you the freedom to use whatever tools you are comfortable with as long as the output meets the required specs: e.g. CJS rather than ESM.
- Has a built-in logger which prints useful information to the terminal. Really helpful during those head scratcher moments.
- Currently no support for local "hot reload" development — you must always deploy your code to see the changes.
- Uses [`@oberan/ffx-api`](../ffx-api/README.md) under-the-hood.

## Installing

Using npm:

```bash
npm install --save-dev @oberan/ffx-cli
```

Using pnpm:

```bash
pnpm add --save-dev @oberan/ffx-cli
```

Using yarn:

```bash
yarn add --dev @oberan/ffx-cli
```

## Usage

Add a `deploy` script to your `package.json` using your desired package manager. For example, using `pnpm`:

```json
"scripts": {
  "deploy": "pnpm ffx deploy --file=/path/to/bundled_file.cjs"
}
```
