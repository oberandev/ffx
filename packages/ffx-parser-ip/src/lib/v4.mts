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
  readonly _tag: "ip_v4";
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
 * Matches a dot '.' character.
 *
 * @category lexers
 * @internal
 */
const dot: P.Parser<string, string> = C.char(".");

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

function runParser(input: string): ParseResult<string, IPv4> {
  const parser = pipe(
    S.fold([octet, dot, octet, dot, octet, dot, octet]),
    P.apFirst(eof),
    P.map(
      (addr): IPv4 => ({
        _tag: "ip_v4",
        value: addr,
      }),
    ),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible IPv4 address.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-ip/v4";
 *
 * const result = parse("192.168.1.1");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): E.Either<string, IPv4> {
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
