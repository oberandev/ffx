# @oberan/ffx-parser-ip

Parse a string into a possible IPv4 / IPv6 address.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-ip
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-ip
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-ip
```

## Usage

```ts
import * as IPv4 from "@oberan/ffx-parser-ip/v4";
import { match } from "ts-pattern";

const eitherIp = IPv4.parse("192.168.1.1");

match(eitherIp)
  .with({ _tag: "Left" }, ({ left: error }) => {
    // do something with the error
  })
  .with({ _tag: "Right" }, ({ right: addr }) => {
    // do something with the IP addr
  })
  .exhaustive();
```
