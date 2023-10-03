# ffx-api

Making software design tradeoffs is never easy and they ultimately either positvely or negatively affect one's perception about said software. `@oberan/ffx-api` was designed with an attempt to balance functional programming concepts (i.e. monads) with writing clean code that requires a low cognitive overhead for those with an OOP background. Maybe we inspire you to learn a little category theory — maybe not. Lastly, this library may not be for you and that is ok.

## What are the differences?

`@flatfile/api`

- Takes the traditional approach with errors by using `throw` whenever something bad happens
- Minimal error message context
- Auto-genereated by [Fern Definitions](https://www.buildwithfern.com/docs/definition)

`@oberan/ffx-api`

- Errors are returned as "data" rather than throwing
- Uses response decoders at runtime to elegantly catch the unexpected — trust but verify
- Response type informs you with _exactly_ what you are getting
- Handcrafted rather than auto-generated

## Usage

```ts
import mkApiClient from "@oberan/ffx-api";
import { match } from "ts-pattern";

const secret: string = process.env.FF_SECRET ?? "";
const environmentId: string = process.env.FF_ENVIRONMENT_ID ?? "";
const client = mkApiClient(secret, environmentId);

// No need to surround with try/catch!
const resp = await client.agents.list();

/*
 * Recommended approach to handling the response => pattern matching
 * It is a more type safe "switch" statement b/c the compiler can enforce exhaustive
 * pattern matching on the `_tag` and successfully narrow the type based on it.
 * Can be switched out with "switch" or "if/else" statements if this isn't your cup of tea.
 */
match(resp)
  .with({ _tag: "decoder_errors" }, ({ reasons }) => {
    // do something with errors
  })
  .with({ _tag: "http_error" }, (httpError) => {
    // do something with error
  })
  .with({ _tag: "successful" }, ({ data }) => {
    // do something with data
  })
  .exhaustive();
```
