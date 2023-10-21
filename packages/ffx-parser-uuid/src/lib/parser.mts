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

// ==================
//       Main
// ==================

/**
 * Matches the 'end of file' but with user-friendly error message.
 *
 * @category lexers
 * @internal
 */
const eof: P.Parser<string, void> = P.expected(P.eof(), "end of string");

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

/**
 * Matches a hexadecimal digit character.
 *
 * @category lexers
 * @internal
 */
const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");

/**
 * Matches a hyphen '-' character.
 *
 * @category lexers
 * @internal
 */
const hyphen: P.Parser<string, string> = C.char("-");

const chunkN = (length: number): P.Parser<string, string> =>
  S.fold(Array.from({ length }, () => hexDigit));

/**
 * Attempts to match a chunk size of 4 hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const chunk4 = chunkN(4);

/**
 * Attempts to match a chunk size of 8 hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const chunk8 = chunkN(8);

/**
 * Attempts to match a chunk size of 12 hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const chunk12 = chunkN(12);

export function runParser(input: string): ParseResult<string, UUID> {
  const parser = pipe(
    S.fold([chunk8, hyphen, chunk4, hyphen, chunk4, hyphen, chunk4, hyphen, chunk12]),
    P.apFirst(eof),
    P.map(isoUUID.wrap),
  );

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
export function parse(input: string): E.Either<string, UUID> {
  return pipe(
    runParser(input),
    E.map(({ value }) => value),
    E.mapLeft(({ expected, input }) => {
      const customErrorMsg: string = `Expected ${expected.join(" ")} at position ${
        input.cursor + 1
      } but found "${input.buffer[input.cursor]}"`;

      return customErrorMsg;
    }),
  );
}

// ==================
//      Helpers
// ==================

/**
 * Opinionated format - convert to lowercase.
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
  return pipe(uuid, isoUUID.modify(Str.toLowerCase));
}

/**
 * Test for the special case of the "max" UUID - `FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF`
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
  return eqUUID.equals(format(uuid), format(isoUUID.wrap("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF")));
}

/**
 * Test for the special case of the "nil" UUID - `00000000-0000-0000-0000-000000000000`
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
 * Unwrap an UUID type.
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
