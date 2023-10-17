# @oberan/ffx-parser-boolean

Parse a string into a possible boolean value.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-boolean
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-boolean
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-boolean
```

## Usage

```ts
import * as Bool from "@oberan/ffx-parser-boolean";
import { match } from "ts-pattern";

const eitherBoolean = Bool.parse("true");

match(eitherBoolean)
  .with({ _tag: "Left" }, ({ left: error }) => {
    // do something with the error
  })
  .with({ _tag: "Right" }, ({ right: bool }) => {
    // do something with the boolean value
  })
  .exhaustive();
```
