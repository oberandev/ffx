<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="media/logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="media/logo_light.svg">
    <img alt="ffx logo" src="media/logo_light.svg">
  </picture>
</div>

<h3 align="center">
  A more functional and type safe approach to FF.
</h3>

<br>

[![codecov](https://codecov.io/gh/oberandev/ffx/graph/badge.svg?token=TLA27SDPAD)](https://codecov.io/gh/oberandev/ffx)
[![Build Status](https://badge.buildkite.com/a04d5ebddf2ee8daa2e56d4a6f9fdf66bd6dff9b47ecb371bb.svg?branch=main)](https://buildkite.com/oberan/ffx)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Why FFX?

- Remove _magic_ from FF configuration by making it more explicit
- We strongly encourage the [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) approach
- Guide you towards the [_pit of success_](https://blog.codinghorror.com/falling-into-the-pit-of-success/) rather than the _pit of dispair_
- Strive to adhere to the [principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)
- All packages export only pure ES Modules
- Code is thoroughly documented with JSDoc for better DX
- Code never _throws_ errors; errors are instead returned as data
- Competing ideas in a community are not a bad thing!

## Versioning

All packages will start at `0.1.0` and will remain in a pre `1.0.0` state until they are stable and battle-tested upon which normal semantic versioning will occur.

> [!IMPORTANT]
> This repo is a work in progress, so we appreciate your patience as we figure things out.
