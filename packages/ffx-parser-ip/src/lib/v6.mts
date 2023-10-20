import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as C from "parser-ts/char";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";

// ==================
//       Types
// ==================

export interface IPv6 {
  readonly _tag: "ip_v6";
  readonly value: string;
}

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

/**
 * Matches a colon ':' character.
 *
 * @category lexers
 * @internal
 */
const colon: P.Parser<string, string> = C.char(":");

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
 * to match four hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const fourHexDigits: P.Parser<string, string> = S.fold([hexDigit, hexDigit, hexDigit, hexDigit]);

/**
 * Attempts to match three hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const threeHexDigits: P.Parser<string, string> = S.fold([hexDigit, hexDigit, hexDigit]);

/**
 * Attempts to match two hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const twoHexDigits: P.Parser<string, string> = S.fold([hexDigit, hexDigit]);

/**
 * Attempts to match one hexadecimal digit.
 *
 * @category combinators
 * @internal
 */
const oneHexDigit: P.Parser<string, string> = hexDigit;

/**
 * Attempts to match a valid group of hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const group: P.Parser<string, string> = P.expected(
  pipe(
    fourHexDigits,
    P.alt(() => threeHexDigits),
    P.alt(() => twoHexDigits),
    P.alt(() => oneHexDigit),
  ),
  "group to be 1-4 hexdigit(s)",
);

function runParser(input: string): ParseResult<string, IPv6> {
  const parser = pipe(
    S.fold([
      group,
      colon,
      group,
      colon,
      group,
      colon,
      group,
      colon,
      group,
      colon,
      group,
      colon,
      group,
      colon,
      group,
    ]),
    P.apFirst(eof),
    P.map(
      (addr): IPv6 => ({
        _tag: "ip_v6",
        value: addr,
      }),
    ),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible IPv6 address.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-ip/v6";
 *
 * const result = parse("2001:0db8:0000:0000:0000:8a2e:0370:7334");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): E.Either<string, IPv6> {
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
