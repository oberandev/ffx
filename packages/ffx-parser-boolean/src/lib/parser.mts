import { Traversable } from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import * as P from "parser-ts/lib/Parser.js";
import { ParseResult } from "parser-ts/lib/ParseResult.js";
import * as S from "parser-ts/lib/string.js";

const pTrueShortform = pipe(
  S.oneOf(Traversable)(["t", "y", "1"]),
  P.map(() => true),
);

const pFalseShortform = pipe(
  S.oneOf(Traversable)(["f", "n", "0"]),
  P.map(() => false),
);

const pTrueLongform = pipe(
  S.oneOf(Traversable)(["on", "yes", "true"]),
  P.map(() => true),
);

const pFalseLongform = pipe(
  S.oneOf(Traversable)(["off", "no", "false"]),
  P.map(() => false),
);

export function runParser(input: string): ParseResult<string, boolean> {
  const parser = pipe(
    P.either(pTrueLongform, () => pFalseLongform),
    P.alt(() => P.either(pTrueShortform, () => pFalseShortform)),
  );

  return S.run(input)(parser);
}

// Expected "one of [ 't', 'f', 'y', 'n', '1', '0', 'on', 'off', 'yes', 'no', 'true', 'false' ]" but found ___

/**
 * Parse a string into a possible Flatfile boolean.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@obera/ffx-parser-boolean";
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string) {}
