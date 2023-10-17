# @oberan/ffx-parser-uuid

Parse a string into a possible UUID.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-uuid
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-uuid
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-uuid
```

## Usage

A common programming practice is to define a type whose representation is identical to an existing one but which has a separate identity in the type system. This library does so with the `UUID` type which is equivalent to a `string` at runtime.

### Example

```ts
import * as Uuid from "@oberan/ffx-parser-uuid";
import { match } from "ts-pattern";

const eitherUuid = Uuid.parse("23d57c30-afe7-11e4-ab7d-12e3f512a338");

match(eitherUuid)
  .with({ _tag: "Left" }, ({ left: error }) => {
    // do something with the error
  })
  .with({ _tag: "Right" }, ({ right: uuid }) => {
    // do something with the uuid
  })
  .exhaustive();
```

### Operations on the `UUID` type

A `UUID` is a _wrapped_ type that can only be created after a successful parse. This affords the internal "core" functions a high level of confidence since they don't always need to re-validate the incoming string value is a valid `UUID`.

```ts
format(uuid: UUID): UUID

isMax(uuid: UUID): boolean

isNil(uuid: UUID): boolean

unwrap(uuid: UUID): string
```
