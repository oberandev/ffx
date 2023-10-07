import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Traversable } from "fp-ts/ReadonlyArray";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";

// ==================
//       Types
// ==================

export interface Ok<T> {
  readonly _tag: "ok";
  readonly value: T;
}

export interface Err<E> {
  readonly _tag: "err";
  readonly value: E;
}

/**
 * A `Result` is either `Ok` meaning the computation succeeded, or it is an `Err` meaning that there was some failure.
 *
 * @since 0.1.0
 */
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

const eof: P.Parser<string, void> = P.expected(P.eof(), "end of string");

const pTrueShortform = pipe(
  S.oneOf(Traversable)(["t", "y", "1"]),
  P.apFirst(eof),
  P.map(() => true),
);

const pFalseShortform = pipe(
  S.oneOf(Traversable)(["f", "n", "0"]),
  P.apFirst(eof),
  P.map(() => false),
);

const pTrueLongform = pipe(
  S.oneOf(Traversable)(["on", "yes", "true"]),
  P.apFirst(eof),
  P.map(() => true),
);

const pFalseLongform = pipe(
  S.oneOf(Traversable)(["off", "no", "false"]),
  P.apFirst(eof),
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
