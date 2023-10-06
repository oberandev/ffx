import * as E from "fp-ts/Either";
import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as Str from "fp-ts/string";
import { Iso } from "monocle-ts";
import * as N from "newtype-ts";
import * as C from "parser-ts/char";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";

// ==================
//       Types
// ==================

export interface UUID extends N.Newtype<{ readonly UUID: unique symbol }, string> {}

export const isoUUID: Iso<UUID, string> = N.iso<UUID>();

const eqUUID: Eq.Eq<UUID> = N.getEq<UUID>(Str.Eq);

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

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");

const pChunk: P.Parser<string, string> = C.many1(hexDigit);
const pHyphen: P.Parser<string, string> = C.char("-");

const chunk4 = P.expected(
  pipe(
    hexDigit,
    P.bindTo("d1"),
    P.bind("d2", () => hexDigit),
    P.bind("d3", () => hexDigit),
    P.bind("d4", () => hexDigit),
    P.map((ds) => Object.values(ds).join("")),
  ),
  "4 hex digits",
);

const chunk8 = P.expected(
  pipe(
    hexDigit,
    P.bindTo("d1"),
    P.bind("d2", () => hexDigit),
    P.bind("d3", () => hexDigit),
    P.bind("d4", () => hexDigit),
    P.bind("d5", () => hexDigit),
    P.bind("d6", () => hexDigit),
    P.bind("d7", () => hexDigit),
    P.bind("d8", () => hexDigit),
    P.map((ds) => Object.values(ds).join("")),
  ),
  "8 hex digits",
);

const chunk12 = P.expected(
  pipe(
    hexDigit,
    P.bindTo("d1"),
    P.bind("d2", () => hexDigit),
    P.bind("d3", () => hexDigit),
    P.bind("d4", () => hexDigit),
    P.bind("d5", () => hexDigit),
    P.bind("d6", () => hexDigit),
    P.bind("d7", () => hexDigit),
    P.bind("d8", () => hexDigit),
    P.bind("d9", () => hexDigit),
    P.bind("d10", () => hexDigit),
    P.bind("d11", () => hexDigit),
    P.bind("d12", () => hexDigit),
    P.map((ds) => Object.values(ds).join("")),
  ),
  "12 hex digits",
);

// count :: (Stream s m t) => Int -> ParsecT s u m a -> ParsecT s u m [a]
// {-# INLINABLE count #-}
// count n p parses n occurrences of p. If n is smaller or equal to zero, the parser equals to return []. Returns a list of n values returned by p.
// count n p           | n <= 0    = return []
//                     | otherwise = sequence (replicate n p)
// function count(n: number, parser: P.Parser<string, string>) {
// chainRec_ might do the trick (many1Till)
// maybe look at sepBy too
// }
// haskell parsec has count (equivalent of replicateM) combinator to parse exactly n number of chars

export function runParser(input: string): ParseResult<string, UUID> {
  // The most used format is the 8-4-4-4-12 format

  const parser = pipe(
    pChunk,
    P.bindTo("c1"),
    P.chainFirst(() => pHyphen),
    P.bind("c2", () => pChunk),
    P.chainFirst(() => pHyphen),
    P.bind("c3", () => pChunk),
    P.chainFirst(() => pHyphen),
    P.bind("c4", () => pChunk),
    P.chainFirst(() => pHyphen),
    P.bind("c5", () => pChunk),
    P.map(({ c1, c2, c3, c4, c5 }) => isoUUID.wrap(`${c1}-${c2}-${c3}-${c4}-${c5}`)),
  );

  // const parser2 = pipe(
  //   pChunk,
  //   P.alt(() => pHyphen),
  //   P.many1,
  // );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible uuid.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-uuid";
 *
 * const result = parse("23d57c30-afe7-11e4-ab7d-12e3f512a338");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): Result<UUID, string> {
  return pipe(
    runParser(input),
    E.matchW(
      ({ expected }) => err(expected.join(" ")),
      ({ value }) => ok(value),
    ),
  );
}

// ==================
//      Helpers
// ==================

/**
 *  Opionionated format - convert to lowercase.
 *
 * @example
 *
 * ```ts
 * import { format } from "@oberan/ffx-parser-uuid";
 *
 * format(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function format(uuid: UUID): UUID {
  return isoUUID.modify((str) => Str.toLowerCase(str))(uuid);
}

/**
 *  Test for the special case of the "max" UUID - `FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF`
 *
 * @example
 *
 * ```ts
 * import { isMax } from "@oberan/ffx-parser-uuid";
 *
 * isMax(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function isMax(uuid: UUID): boolean {
  return eqUUID.equals(uuid, isoUUID.wrap("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"));
}

/**
 *  Test for the special case of the "nil" UUID - `00000000-0000-0000-0000-000000000000`
 *
 * @example
 *
 * ```ts
 * import { isNil } from "@oberan/ffx-parser-uuid";
 *
 * isNil(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function isNil(uuid: UUID): boolean {
  return eqUUID.equals(uuid, isoUUID.wrap("00000000-0000-0000-0000-000000000000"));
}

/**
 *  Unwrap a UUID type.
 *
 * @example
 *
 * ```ts
 * import { unwrap } from "@oberan/ffx-parser-uuid";
 *
 * unwrap(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function unwrap(uuid: UUID): string {
  return isoUUID.unwrap(uuid);
}
