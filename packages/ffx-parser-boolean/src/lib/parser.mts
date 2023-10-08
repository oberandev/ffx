import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Traversable } from "fp-ts/ReadonlyArray";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";

// ==================
//       Main
// ==================

const eof: P.Parser<string, void> = P.expected(P.eof(), "end of string");

const trueShortform = pipe(
  S.oneOf(Traversable)(["t", "y", "1"]),
  P.apFirst(eof),
  P.map(() => true),
);

const falseShortform = pipe(
  S.oneOf(Traversable)(["f", "n", "0"]),
  P.apFirst(eof),
  P.map(() => false),
);

const trueLongform = pipe(
  S.oneOf(Traversable)(["on", "yes", "true"]),
  P.apFirst(eof),
  P.map(() => true),
);

const falseLongform = pipe(
  S.oneOf(Traversable)(["off", "no", "false"]),
  P.apFirst(eof),
  P.map(() => false),
);

export function runParser(input: string): ParseResult<string, boolean> {
  const parser = pipe(
    P.either(trueLongform, () => falseLongform),
    P.alt(() => P.either(trueShortform, () => falseShortform)),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible Flatfile boolean.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-boolean";
 *
 * const result = parse("true");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): E.Either<string, boolean> {
  return pipe(
    runParser(input),
    E.matchW(
      ({ expected, input }) => {
        const customErrorMsg: string = `Expected ${expected.join(
          " ",
        )} but found "${input.buffer.join("")}"`;

        return E.left(customErrorMsg);
      },
      ({ value }) => E.right(value),
    ),
  );
}
