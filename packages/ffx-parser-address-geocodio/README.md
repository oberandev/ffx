# @oberan/ffx-parser-address-geocodio

Parse a string into possible US & CA addresses using Geocodio API.

## Installing

Using npm:

```bash
npm install @oberan/ffx-parser-address-geocodio
```

Using pnpm:

```bash
pnpm add @oberan/ffx-parser-address-geocodio
```

Using yarn:

```bash
yarn add @oberan/ffx-parser-address-geocodio
```

## Usage

```ts
import Geocodio from "@oberan/ffx-parser-address-geocodio";
import { match } from "ts-pattern";

const geocoder = new Geocodio("API_KEY");

// inside some async function
const resp = await geocoder.parseSingle("525 University Ave, Toronto, ON, Canada", "CA");

match(resp)
  .with({ _tag: "decoder_errors" }, ({ reasons }) => {
    // do something with errors
  })
  .with({ _tag: "single_address" }, ({ data }) => {
    // do something with data
  })
  .exhaustive();
```
