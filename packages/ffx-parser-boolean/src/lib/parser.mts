import { Traversable } from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as P from "parser-ts/lib/Parser.js";
import { ParseResult } from "parser-ts/lib/ParseResult.js";
import * as S from "parser-ts/lib/string.js";

// ==================
//       Types
// ==================

export interface Ok<T> {
  _tag: "ok";
  value: T;
}

export interface Err<E> {
  _tag: "err";
  value: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T> {
  return {
    _tag: "ok",
    value,
  };
}

function err<E>(value: E): Err<E> {
  return {
    _tag: "err",
    value,
  };
}

// ==================
//       Main
// ==================

const pTrueShortform = pipe(
  S.oneOf(Traversable)(["t", "y", "1"]),
  P.chain(() => P.expected(P.eof(), "end of string")),
  P.map(() => true),
);

const pFalseShortform = pipe(
  S.oneOf(Traversable)(["f", "n", "0"]),
  P.chain(() => P.expected(P.eof(), "end of string")),
  P.map(() => false),
);

const pTrueLongform = pipe(
  S.oneOf(Traversable)(["on", "yes", "true"]),
  P.chain(() => P.expected(P.eof(), "end of string")),
  P.map(() => true),
);

const pFalseLongform = pipe(
  S.oneOf(Traversable)(["off", "no", "false"]),
  P.chain(() => P.expected(P.eof(), "end of string")),
  P.map(() => false),
);

export function runParser(input: string): ParseResult<string, boolean> {
  const parser = pipe(
    P.either(pTrueLongform, () => pFalseLongform),
    P.alt(() => P.either(pTrueShortform, () => pFalseShortform)),
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
export function parse(input: string): Result<boolean, string> {
  return pipe(
    runParser(input),
    E.matchW(
      ({ expected, input }) => {
        const customErrorMsg: string = `Expected ${expected.join(
          " ",
        )} but found "${input.buffer.join("")}"`;

        return err(customErrorMsg);
      },
      ({ value }) => ok(value),
    ),
  );
}
