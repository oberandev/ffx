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

const eof: P.Parser<string, void> = P.expected(P.eof(), "end of string");

const threeDigitOctet: P.Parser<string, string> = pipe(
  C.digit,
  P.bindTo("d1"),
  P.bind("d2", () => C.digit),
  P.bind("d3", () => C.digit),
  P.map((ds) => Object.values(ds).join("")),
);

const twoDigitOctet: P.Parser<string, string> = pipe(
  C.digit,
  P.bindTo("d1"),
  P.bind("d2", () => C.digit),
  P.map((ds) => Object.values(ds).join("")),
);

const oneDigitOctet: P.Parser<string, string> = C.digit;

const octet: P.Parser<string, string> = P.expected(
  pipe(
    threeDigitOctet,
    P.alt(() => twoDigitOctet),
    P.alt(() => oneDigitOctet),
  ),
  "octet to be 1-3 digit(s)",
);

const nzDigit: P.Parser<string, string> = P.cut(P.expected(C.oneOf("123456789"), "non-zero digit"));

const nzThreeDigitOctet: P.Parser<string, string> = pipe(
  nzDigit,
  P.bindTo("d1"),
  P.bind("d2", () => C.digit),
  P.bind("d3", () => C.digit),
  P.map((ds) => Object.values(ds).join("")),
);

const nzTwoDigitOctet: P.Parser<string, string> = pipe(
  nzDigit,
  P.bindTo("d1"),
  P.bind("d2", () => C.digit),
  P.map((ds) => Object.values(ds).join("")),
);

const nzOneDigitOctet: P.Parser<string, string> = nzDigit;

const nzOctet: P.Parser<string, string> = pipe(
  nzThreeDigitOctet,
  P.alt(() => nzTwoDigitOctet),
  P.alt(() => nzOneDigitOctet),
);

export function runParser(input: string): ParseResult<string, string> {
  const parser = pipe(
    nzOctet,
    P.bindTo("o1"),
    P.apFirst(C.char(".")),
    P.bind("o2", () => octet),
    P.apFirst(C.char(".")),
    P.bind("o3", () => octet),
    P.apFirst(C.char(".")),
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
