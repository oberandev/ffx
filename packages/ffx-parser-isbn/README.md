# @oberan/ffx-parser-isbn

Parse a string into a possible ISBN10 / ISBN13.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-isbn
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-isbn
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-isbn
```

## Usage

This library exposes the `ISBN` type which is a discriminated union of either an `ISBN10` or `ISBN13` address.

### Example

```ts
import * as Isbn from "@oberan/ffx-parser-isbn";
import { match } from "ts-pattern";

const eitherIsbn = Isbn.parse("978-1-4028-9462-6");

match(eitherIsbn)
  .with({ _tag: "Left" }, ({ left: error }) => {
    // do something with the error
  })
  .with({ _tag: "Right" }, ({ right: isbn }) => {
    // do something with the ISBN10 / ISBN13
  })
  .exhaustive();
```

### Operations on the `ISBN` type

```ts
upConvert(input: ISBN): ISBN

downConvert(input: ISBN): Option<ISBN>
```
