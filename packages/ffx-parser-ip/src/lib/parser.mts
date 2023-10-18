import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as Str from "fp-ts/string";
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
 */
const eof: P.Parser<string, void> = P.expected(P.eof(), "end of string");

/**
 * Matches a dot '.' character.
 *
 * @category lexers
 */
const dot: P.Parser<string, string> = C.char(".");

/**
 * Matches a digit (0-9) character.
 *
 * @category lexers
 */
const digit: P.Parser<string, string> = C.digit;

/**
 * Matches a non-zero digit (1-9) character.
 *
 * @category lexers
 */
const nzDigit: P.Parser<string, string> = P.expected(C.oneOf("123456789"), "non-zero digit");

/**
 * Attempts to parse a 3-digit octet where the first digit can never be a '0'.
 *
 * @category parsers
 */
const threeDigitOctet: P.Parser<string, string> = pipe(
  digit,
  P.bindTo("d1"),
  P.bind("d2", () => digit),
  P.bind("d3", () => digit),
  P.map((ds) => Object.values(ds).join("")),
);

const twoDigitOctet: P.Parser<string, string> = pipe(
  digit,
  P.bindTo("d1"),
  P.bind("d2", () => digit),
  P.map((ds) => Object.values(ds).join("")),
);

const oneDigitOctet: P.Parser<string, string> = digit;

const octet: P.Parser<string, string> = P.expected(
  pipe(
    threeDigitOctet,
    P.alt(() => twoDigitOctet),
    P.alt(() => oneDigitOctet),
  ),
  "octet to be 1-3 digit(s)",
);

const nzThreeDigitOctet: P.Parser<string, string> = pipe(
  P.cut(nzDigit),
  P.bindTo("d1"),
  P.bind("d2", () => digit),
  P.bind("d3", () => digit),
  P.map((ds) => Object.values(ds).join("")),
);

const nzTwoDigitOctet: P.Parser<string, string> = pipe(
  P.cut(nzDigit),
  P.bindTo("d1"),
  P.bind("d2", () => digit),
  P.map((ds) => Object.values(ds).join("")),
);

const nzOneDigitOctet: P.Parser<string, string> = P.cut(nzDigit);

const nzOctet: P.Parser<string, string> = pipe(
  nzThreeDigitOctet,
  P.alt(() => nzTwoDigitOctet),
  P.alt(() => nzOneDigitOctet),
);

/*
 * Attempts to parse a quad-dotted IPv4 address.
 */
export function runParser(input: string): ParseResult<string, string> {
  const parser = pipe(
    nzOctet,
    P.bindTo("o1"),
    P.apFirst(dot),
    P.bind("o2", () => octet),
    P.apFirst(dot),
    P.bind("o3", () => octet),
    P.apFirst(dot),
    P.bind("o4", () => octet),
    P.apFirst(eof),
    P.map((octets) => pipe(Object.values(octets), RA.intercalate(Str.Monoid)("."))),
  );

  return S.run(input)(parser);
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
    E.matchW(
      ({ expected, input }) => {
        const customErrorMsg: string = `Expected ${expected.join(" ")} at position ${
          input.cursor + 1
        } but found "${input.buffer[input.cursor]}"`;

        return E.left(customErrorMsg);
      },
      ({ value }) => {
        return E.right({
          _tag: "ipv4",
          value,
        });
      },
    ),
  );
}
