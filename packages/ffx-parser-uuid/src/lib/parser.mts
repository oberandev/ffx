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

type Version = "v1" | "v2" | "v3" | "v4" | "v5";

// ==================
//       Main
// ==================

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");
// PR this and octDigit to repo
// https://github.com/purescript-contrib/purescript-parsing/blob/v10.0.0/src/Parsing/String/Basic.purs#L58-L58
// contribute others from parsec??
// https://hackage.haskell.org/package/parsec-3.1.17.0/docs/Text-ParserCombinators-Parsec-Char.html

const pChunk: P.Parser<string, string> = C.many1(hexDigit);
const pHyphen: P.Parser<string, string> = C.char("-");

// count :: (Stream s m t) => Int -> ParsecT s u m a -> ParsecT s u m [a]
// {-# INLINABLE count #-}
// count n p parses n occurrences of p. If n is smaller or equal to zero, the parser equals to return []. Returns a list of n values returned by p.
// count n p           | n <= 0    = return []
//                     | otherwise = sequence (replicate n p)
// function count(n: number, parser: P.Parser<string, string>) {
// chainRec_ might do the trick (many1Till)
// maybe look at sepBy too
// }

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

// haskell parsec has count (equivalent of replicateM) combinator to parse exactly n number of chars

export function parse(onFailure: (errors: string) => void, onSuccess: (uuid: UUID) => void) {
  return function (input: string) {
    pipe(
      runParser(input),
      E.matchW(
        ({ expected }) => onFailure(expected.join(" ")), // "Expected " + err.expected.join(" ") + " at position " + (err.input.cursor + 1),
        ({ value }) => onSuccess(value),
      ),
    );
  };
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
 * import * as Uuid from "@oberan/ffx-parser-uuid";
 *
 * Uuid.format(uuid);
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
 * import * as Uuid from "@oberan/ffx-parser-uuid";
 *
 * Uuid.isMax(uuid);
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
 * import * as Uuid from "@oberan/ffx-parser-uuid";
 *
 * Uuid.isNil(uuid);
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
 * import * as Uuid from "@oberan/ffx-parser-uuid";
 *
 * Uuid.unwrap(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function unwrap(uuid: UUID): string {
  return isoUUID.unwrap(uuid);
}
