# ffx-parser-uuid

A small, yet helpful library to parse UUID's.

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

A common programming practice is to define a type whose representation is identical to an existing one but which has a separate identity in the type system. This library does so with the `UUID` type.

### Example

```ts
import * as Uuid from "@oberan/ffx-parser-uuid";

Uuid.parse(
  (errors: string) => {
    // handle failure
  },
  (wrapped: Uuid.UUID) => {
    // handle success
    // don't forget to unwrap value with `Uuid.unwrap(wrapped)`
  },
)("23d57c30-afe7-11e4-ab7d-12e3f512a338");
```

### Operations on the `UUID` type

Since `UUID` is a wrapped type that can only be created after a successful parse, we provide convenience functions (see below) to operate on the type. This affords the internal "core" functions a high level of confidence since they don't always need to validate the incoming string value is a proper `UUID`.

```ts
format(uuid: UUID): UUID

isMax(uuid: UUID): boolean

isNil(uuid: UUID): boolean

unwrap(uuid: UUID): string
```
