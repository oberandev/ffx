import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as C from "parser-ts/char";
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

type MacAddr = IPv4 | IPv6;

interface IPv4 {
  readonly _tag: "ip_v4";
  readonly data: Eui48;
}

interface IPv6 {
  readonly _tag: "ip_v6";
  readonly data: Eui64;
}

type Eui48 = SixGroupsByColon | SixGroupsByHyphen | ThreeGroupsByDot;

interface SixGroupsByColon {
  readonly _tag: "six_groups_by_colon";
  readonly data: string;
}

interface SixGroupsByHyphen {
  readonly _tag: "six_groups_by_hyphen";
  readonly data: string;
}

interface ThreeGroupsByDot {
  readonly _tag: "three_groups_by_dot";
  readonly data: string;
}

type Eui64 = EightGroupsByColon | EightGroupsByHyphen | FourGroupsByDot;

interface EightGroupsByColon {
  readonly _tag: "eight_groups_by_colon";
  readonly data: string;
}

interface EightGroupsByHyphen {
  readonly _tag: "eight_groups_by_hyphen";
  readonly data: string;
}

interface FourGroupsByDot {
  readonly _tag: "four_groups_by_dot";
  readonly data: string;
}

// ==================
//       Main
// ==================

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");

const pSixGroupsByColon: P.Parser<string, Eui48> = pipe(
  S.string("f"),
  // P.chain(() => P.expected(P.eof(), "end of string")),
  P.map((value) => ({
    _tag: "six_groups_by_colon",
    data: value,
  })),
);

const pSixGroupsByHyphen: P.Parser<string, Eui48> = pipe(
  S.string("a"),
  P.map((value) => ({
    _tag: "six_groups_by_hyphen",
    data: value,
  })),
);

const pThreeGroupsByDot: P.Parser<string, Eui48> = pipe(
  S.string("a"),
  P.map((value) => ({
    _tag: "three_groups_by_dot",
    data: value,
  })),
);

const pEui48: P.Parser<string, Eui48> = pipe(
  pSixGroupsByColon,
  P.alt(() => pSixGroupsByHyphen),
  P.alt(() => pThreeGroupsByDot),
);

const pIPv4: P.Parser<string, MacAddr> = pipe(
  pEui48,
  P.map((value) => ({
    _tag: "ip_v4",
    data: value,
  })),
);

const pEightGroupsByColon: P.Parser<string, Eui64> = pipe(
  S.string("a"),
  P.map((value) => ({
    _tag: "eight_groups_by_colon",
    data: value,
  })),
);

const pEightGroupsByHyphen: P.Parser<string, Eui64> = pipe(
  S.string("a"),
  P.map((value) => ({
    _tag: "eight_groups_by_hyphen",
    data: value,
  })),
);

const pFourGroupsByDot: P.Parser<string, Eui64> = pipe(
  S.string("a"),
  P.map((value) => ({
    _tag: "four_groups_by_dot",
    data: value,
  })),
);

const pEui64: P.Parser<string, Eui64> = pipe(
  pEightGroupsByColon,
  P.alt(() => pEightGroupsByHyphen),
  P.alt(() => pFourGroupsByDot),
);

const pIPv6: P.Parser<string, MacAddr> = pipe(
  pEui64,
  P.map((value) => ({
    _tag: "ip_v6",
    data: value,
  })),
);

export function runParser(input: string): ParseResult<string, MacAddr> {
  const parser = pipe(P.either(pIPv4, () => pIPv6));

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible mac address.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-mac";
 *
 * const result = parse("ff:ff:ff:ff:ff:ff");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): Result<MacAddr, string> {
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
