<div align="center">
  <h1>FFX</h1>
  <a href="https://codecov.io/gh/oberandev/ffx">
    <img src="https://codecov.io/gh/oberandev/ffx/graph/badge.svg?token=TLA27SDPAD"/>
  </a>
  <a href="https://oberan.semaphoreci.com/badges/ffx/branches/main.svg">
    <img src="https://oberan.semaphoreci.com/badges/ffx/branches/main.svg" alt="Build Status">
  </a>
  <img alt="code style prettier badge" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat" />
  <img alt="commitizen friendly badge" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" />
  <!-- https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#specifying-the-theme-an-image-is-shown-to -->
</div>

## Why FFX?

More coming soon.

- A more functional and type safe approach to FF
- More explicit FF configuration removes "magic" and improves understanding of code
- Competing ideas in a community are not a bad thing!

## Local development setup

1. Install [Nix](https://nix.dev/tutorials/install-nix)
2. Install and configure [direnv](https://github.com/direnv/direnv)
3. Clone the repo and run `direnv allow` after changing into the directory

## Running tasks

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
