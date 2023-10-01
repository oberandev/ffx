**Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Working locally](#working-locally)
  - [Develop](#develop)
  - [Test](#test)
  - [Running tasks](#running-tasks)
  - [Verdaccio](#verdaccio)

## Code of Conduct

This project has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect project participants to adhere to it.
Please read [the full text](/CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Ways to Contribute

There are many ways to contribute to Formik, code contribution is one aspect of it.

- **Spread the word.** Talk about us with your coworkers.
- **Give us feedback.** Tell us what we're doing well or where we can improve. Please upvote (👍) the issues that you are the most interested in seeing solved.
- **Make changes happen.** Suggest changes to the documentation or code.
- **Report bugs** or missing features by creating an issue.
- **Review and comment** on existing pull requests and issues.

## Working locally

The repo is managed with NX, Nix, and pnpm workspaces.

### Develop

1. Install [Nix](https://nix.dev/tutorials/install-nix)
2. Install and configure [direnv](https://github.com/direnv/direnv)
3. Clone the repo and run the following:

```sh
cp .envrc.example .envrc
direnv allow
pnpm install
```

### Test

Run vitest on the affected projects

```sh
pnpm nx affected -t tests
```

### Running tasks

To execute tasks with Nx use the following syntax:

```
nx <target> <project> <...options>
```

You can also run multiple targets:

```
nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets are defined in the `projects.json`. Learn more [in the docs](https://nx.dev/core-features/run-tasks).

### Verdaccio

You can publish packages to a local instance of [Verdaccio](https://github.com/verdaccio/verdaccio) for testing/verification.

```sh
pnpm nx local-registry
```
