import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as Str from "fp-ts/string";
import { Lens } from "monocle-ts";
import * as C from "parser-ts/char";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";
import { match } from "ts-pattern";

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

export type MacAddr = IPv4 | IPv6;

export interface IPv4 {
  readonly _tag: "ip_v4";
  readonly value: Eui48;
}

export interface IPv6 {
  readonly _tag: "ip_v6";
  readonly value: Eui64;
}

type Eui48 = SixGroupsByColon | SixGroupsByHyphen | ThreeGroupsByDot;

interface SixGroupsByColon {
  readonly _tag: "six_groups_by_colon";
  readonly value: string;
}

interface SixGroupsByHyphen {
  readonly _tag: "six_groups_by_hyphen";
  readonly value: string;
}

interface ThreeGroupsByDot {
  readonly _tag: "three_groups_by_dot";
  readonly value: string;
}

type Eui64 = EightGroupsByColon | EightGroupsByHyphen | FourGroupsByDot;

interface EightGroupsByColon {
  readonly _tag: "eight_groups_by_colon";
  readonly value: string;
}

interface EightGroupsByHyphen {
  readonly _tag: "eight_groups_by_hyphen";
  readonly value: string;
}

interface FourGroupsByDot {
  readonly _tag: "four_groups_by_dot";
  readonly value: string;
}

// ==================
//       Main
// ==================

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");

const hyphen: P.Parser<string, string> = C.char("-");

const dot: P.Parser<string, string> = C.char(".");

const colon: P.Parser<string, string> = C.char(":");

const groupN = (length: number): P.Parser<string, string> =>
  S.fold(Array.from({ length }, () => hexDigit));

const group2 = groupN(2);
const group4 = groupN(4);

const pSixGroupsByColon: P.Parser<string, Eui48> = pipe(
  group2,
  P.bindTo("g1"),
  P.apFirst(colon),
  P.bind("g2", () => group2),
  P.apFirst(colon),
  P.bind("g3", () => group2),
  P.apFirst(colon),
  P.bind("g4", () => group2),
  P.apFirst(colon),
  P.bind("g5", () => group2),
  P.apFirst(colon),
  P.bind("g6", () => group2),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "six_groups_by_colon",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)(":")),
  })),
);

const pSixGroupsByHyphen: P.Parser<string, Eui48> = pipe(
  group2,
  P.bindTo("g1"),
  P.apFirst(hyphen),
  P.bind("g2", () => group2),
  P.apFirst(hyphen),
  P.bind("g3", () => group2),
  P.apFirst(hyphen),
  P.bind("g4", () => group2),
  P.apFirst(hyphen),
  P.bind("g5", () => group2),
  P.apFirst(hyphen),
  P.bind("g6", () => group2),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "six_groups_by_hyphen",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)("-")),
  })),
);

const pThreeGroupsByDot: P.Parser<string, Eui48> = pipe(
  group4,
  P.bindTo("g1"),
  P.apFirst(dot),
  P.bind("g2", () => group4),
  P.apFirst(dot),
  P.bind("g3", () => group4),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "three_groups_by_dot",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)(".")),
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
    value: value,
  })),
);

const pEightGroupsByColon: P.Parser<string, Eui64> = pipe(
  group2,
  P.bindTo("g1"),
  P.apFirst(colon),
  P.bind("g2", () => group2),
  P.apFirst(colon),
  P.bind("g3", () => group2),
  P.apFirst(colon),
  P.bind("g4", () => group2),
  P.apFirst(colon),
  P.bind("g5", () => group2),
  P.apFirst(colon),
  P.bind("g6", () => group2),
  P.apFirst(colon),
  P.bind("g7", () => group2),
  P.apFirst(colon),
  P.bind("g8", () => group2),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "eight_groups_by_colon",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)(":")),
  })),
);

const pEightGroupsByHyphen: P.Parser<string, Eui64> = pipe(
  group2,
  P.bindTo("g1"),
  P.apFirst(hyphen),
  P.bind("g2", () => group2),
  P.apFirst(hyphen),
  P.bind("g3", () => group2),
  P.apFirst(hyphen),
  P.bind("g4", () => group2),
  P.apFirst(hyphen),
  P.bind("g5", () => group2),
  P.apFirst(hyphen),
  P.bind("g6", () => group2),
  P.apFirst(hyphen),
  P.bind("g7", () => group2),
  P.apFirst(hyphen),
  P.bind("g8", () => group2),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "eight_groups_by_hyphen",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)("-")),
  })),
);

const pFourGroupsByDot: P.Parser<string, Eui64> = pipe(
  group4,
  P.bindTo("g1"),
  P.apFirst(dot),
  P.bind("g2", () => group4),
  P.apFirst(dot),
  P.bind("g3", () => group4),
  P.apFirst(dot),
  P.bind("g4", () => group4),
  P.apFirst(P.expected(P.eof(), "end of string")),
  P.map((groups) => ({
    _tag: "four_groups_by_dot",
    value: pipe(Object.values(groups), RA.intercalate(Str.Monoid)(".")),
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
    value: value,
  })),
);

const addrL = Lens.fromPath<MacAddr>()(["value", "value"]);

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
        const customErrorMsg: string = `Expected ${expected[input.cursor % 2]} at position ${
          input.cursor + 1
        } but found "${input.buffer[input.cursor]}"`;

        return err(customErrorMsg);
      },
      ({ value }) => ok(value),
    ),
  );
}

// ==================
//      Helpers
// ==================

/**
 *  Opinionated format - convert to uppercase.
 *
 * @example
 *
 * ```ts
 * import { format } from "@oberan/ffx-parser-mac";
 *
 * format(macAddr);
 * ```
 *
 * @since 0.1.0
 */
export function format(macAddr: MacAddr): MacAddr {
  return addrL.modify(Str.toUpperCase)(macAddr);
}

/**
 * Determines if a given mac address is also a broadcast address.
 *
 * @example
 *
 * ```ts
 * import { isBroadcast } from "@oberan/ffx-parser-mac";
 *
 * isBroadcast(macAddr);
 * ```
 *
 * @since 0.1.0
 */
export function isBroadcast(macAddr: MacAddr): boolean {
  return match(format(macAddr))
    .with({ _tag: "ip_v4" }, ({ value: mac }) => {
      return match(mac)
        .with({ _tag: "six_groups_by_colon" }, () => {
          return Str.Eq.equals(mac.value, "FF:FF:FF:FF:FF:FF");
        })
        .with({ _tag: "six_groups_by_hyphen" }, () => {
          return Str.Eq.equals(mac.value, "FF-FF-FF-FF-FF-FF");
        })
        .with({ _tag: "three_groups_by_dot" }, () => {
          return Str.Eq.equals(mac.value, "FFFF.FFFF.FFFF");
        })
        .exhaustive();
    })
    .with({ _tag: "ip_v6" }, ({ value: mac }) => {
      return match(mac)
        .with({ _tag: "eight_groups_by_colon" }, () => {
          return Str.Eq.equals(mac.value, "FF:FF:FF:FF:FF:FF:FF:FF");
        })
        .with({ _tag: "eight_groups_by_hyphen" }, () => {
          return Str.Eq.equals(mac.value, "FF-FF-FF-FF-FF-FF-FF-FF");
        })
        .with({ _tag: "four_groups_by_dot" }, () => {
          return Str.Eq.equals(mac.value, "FFFF.FFFF.FFFF.FFFF");
        })
        .exhaustive();
    })
    .exhaustive();
}
