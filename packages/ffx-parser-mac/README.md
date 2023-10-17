# @oberan/ffx-parser-mac

Parse a string into a possible IPv4 / IPv6 mac address.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-mac
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-mac
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-mac
```

## Usage

This library exposes the `MacAddr` type which is a discriminated union of either an `IPv4` or `IPv6` address.

### Example

```ts
import * as Mac from "@oberan/ffx-parser-mac";
import { match } from "ts-pattern";

const eitherMac = Mac.parse("ff:ff:ff:ff:ff:ff:ff:ff");

match(eitherMac)
  .with({ _tag: "Left" }, ({ left: error }) => {
    // do something with the error
  })
  .with({ _tag: "Right" }, ({ right: addr }) => {
    // do something with the IPv4 / IPv6 mac addr
  })
  .exhaustive();
```

### Operations on the `MacAddr` type

```ts
format(macAddr: MacAddr): MacAddr

isBroadcast(macAddr: MacAddr): boolean
```
