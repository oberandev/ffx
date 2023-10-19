import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as C from "parser-ts/char";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";

// ==================
//       Types
// ==================

export interface IPv4 {
  readonly _tag: "ipv4";
  readonly value: string;
}

export interface IPv6 {
  readonly _tag: "ipv6";
  readonly value: string;
}

export type IP = IPv4 | IPv6;

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
 * Matches a dot '.' character.
 *
 * @category lexers
 * @internal
 */
const dot: P.Parser<string, string> = C.char(".");

/**
 * Matches a colon ':' character.
 *
 * @category lexers
 * @internal
 */
const colon: P.Parser<string, string> = C.char(":");

/**
 * Matches a digit (0-9) character.
 *
 * @category lexers
 * @internal
 */
const digit: P.Parser<string, string> = C.digit;

/**
 * Matches a non-zero digit (1-9) character.
 *
 * @category lexers
 * @internal
 */
const nzDigit: P.Parser<string, string> = P.expected(C.oneOf("123456789"), "non-zero digit");

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
 * Attempts to parse a 3-digit octet where the first digit can never be a '0'.
 *
 * @category combinators
 * @internal
 */
const threeDigitOctet: P.Parser<string, string> = S.fold([nzDigit, digit, digit]);

/**
 * Attempts to parse a 2-digit octet where the first digit can never be a '0'.
 *
 * @category combinators
 * @internal
 */
const twoDigitOctet: P.Parser<string, string> = S.fold([nzDigit, digit]);

/**
 * Attempts to parse a 1-digit octet where the digit can never be a '0'.
 *
 * @category combinators
 * @internal
 */
const oneDigitOctet: P.Parser<string, string> = digit;

/**
 * Attempts to parse a 1-3 digit octet.
 *
 * @category combinators
 * @internal
 */
const octet: P.Parser<string, string> = P.expected(
  pipe(
    threeDigitOctet,
    P.alt(() => twoDigitOctet),
    P.alt(() => oneDigitOctet),
  ),
  "octet to be 1-3 digit(s)",
);

/**
 * Attempts to match a quad-dotted IPv4 address.
 *
 * @category combinators
 * @internal
 */
export const ipv4: P.Parser<string, IP> = pipe(
  S.fold([octet, dot, octet, dot, octet, dot, octet]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "ipv4",
    value: addr,
  })),
);

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

/**
 * Attempts to match an IPv6 variant.
 *
 * @category combinators
 * @internal
 */
export const ipv6: P.Parser<string, IP> = pipe(
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
  P.map((addr) => ({
    _tag: "ipv6",
    value: addr,
  })),
);

function runParser(input: string): ParseResult<string, IP> {
  // return S.run(input)(P.either(ipv4, () => ipv6));
  return S.run(input)(ipv4);
}

/**
 * Parse a string into a possible IPv4 or IPv6 address.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-ip";
 *
 * const result = parse("192.168.1.1");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): E.Either<string, IP> {
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
