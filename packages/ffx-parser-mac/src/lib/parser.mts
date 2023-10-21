import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
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

const groupN = (length: number): P.Parser<string, string> =>
  S.fold(Array.from({ length }, () => hexDigit));

/**
 * Attempts to match a chunk size of 2 hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const group2 = groupN(2);

/**
 * Attempts to match a chunk size of 4 hexadecimal digits.
 *
 * @category combinators
 * @internal
 */
const group4 = groupN(4);

/**
 * Attempts to match six groups of hexadecimal digits separated by a colon.
 *
 * @category combinators
 * @internal
 */
const sixGroupsByColon: P.Parser<string, Eui48> = pipe(
  S.fold([group2, colon, group2, colon, group2, colon, group2, colon, group2, colon, group2]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "six_groups_by_colon",
    value: addr,
  })),
);

/**
 * Attempts to match six groups of hexadecimal digits separated by a hyphen.
 *
 * @category combinators
 * @internal
 */
const sixGroupsByHyphen: P.Parser<string, Eui48> = pipe(
  S.fold([group2, hyphen, group2, hyphen, group2, hyphen, group2, hyphen, group2, hyphen, group2]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "six_groups_by_hyphen",
    value: addr,
  })),
);

/**
 * Attempts to match three groups of hexadecimal digits separated by a dot.
 *
 * @category combinators
 * @internal
 */
const threeGroupsByDot: P.Parser<string, Eui48> = pipe(
  S.fold([group4, dot, group4, dot, group4]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "three_groups_by_dot",
    value: addr,
  })),
);

/**
 * Attempts to match an EUI48 variant.
 *
 * @category combinators
 * @internal
 */
const ipv4: P.Parser<string, MacAddr> = pipe(
  sixGroupsByColon,
  P.alt(() => sixGroupsByHyphen),
  P.alt(() => threeGroupsByDot),
  P.map((addr) => ({
    _tag: "ip_v4",
    value: addr,
  })),
);

/**
 * Attempts to match eight groups of hexadecimal digits separated by a colon.
 *
 * @category combinators
 * @internal
 */
const eightGroupsByColon: P.Parser<string, Eui64> = pipe(
  S.fold([
    group2,
    colon,
    group2,
    colon,
    group2,
    colon,
    group2,
    colon,
    group2,
    colon,
    group2,
    colon,
    group2,
    colon,
    group2,
  ]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "eight_groups_by_colon",
    value: addr,
  })),
);

/**
 * Attempts to match eight groups of hexadecimal digits separated by a hyphen.
 *
 * @category combinators
 * @internal
 */
const eightGroupsByHyphen: P.Parser<string, Eui64> = pipe(
  S.fold([
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
    hyphen,
    group2,
  ]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "eight_groups_by_hyphen",
    value: addr,
  })),
);

/**
 * Attempts to match four groups of hexadecimal digits separated by a dot.
 *
 * @category combinators
 * @internal
 */
const fourGroupsByDot: P.Parser<string, Eui64> = pipe(
  S.fold([group4, dot, group4, dot, group4, dot, group4]),
  P.apFirst(eof),
  P.map((addr) => ({
    _tag: "four_groups_by_dot",
    value: addr,
  })),
);

/**
 * Attempts to match an EUI64 variant.
 *
 * @category combinators
 * @internal
 */
const ipv6: P.Parser<string, MacAddr> = pipe(
  eightGroupsByColon,
  P.alt(() => eightGroupsByHyphen),
  P.alt(() => fourGroupsByDot),
  P.map((addr) => ({
    _tag: "ip_v6",
    value: addr,
  })),
);

function runParser(input: string): ParseResult<string, MacAddr> {
  const parser = pipe(P.either(ipv4, () => ipv6));

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
export function parse(input: string): E.Either<string, MacAddr> {
  return pipe(
    runParser(input),
    E.map(({ value }) => value),
    E.mapLeft(({ expected, input }) => {
      const customErrorMsg: string = `Expected ${expected[input.cursor % 2]} at position ${
        input.cursor + 1
      } but found "${input.buffer[input.cursor]}"`;

      return customErrorMsg;
    }),
  );
}

// ==================
//      Helpers
// ==================

const addrL = Lens.fromPath<MacAddr>()(["value", "value"]);

/**
 *  Opinionated format — convert to uppercase.
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
  return pipe(macAddr, addrL.modify(Str.toUpperCase));
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
    .with({ _tag: "ip_v4" }, ({ value: addr }) => {
      return match(addr)
        .with({ _tag: "six_groups_by_colon" }, () => {
          return Str.Eq.equals(addr.value, "FF:FF:FF:FF:FF:FF");
        })
        .with({ _tag: "six_groups_by_hyphen" }, () => {
          return Str.Eq.equals(addr.value, "FF-FF-FF-FF-FF-FF");
        })
        .with({ _tag: "three_groups_by_dot" }, () => {
          return Str.Eq.equals(addr.value, "FFFF.FFFF.FFFF");
        })
        .exhaustive();
    })
    .with({ _tag: "ip_v6" }, ({ value: addr }) => {
      return match(addr)
        .with({ _tag: "eight_groups_by_colon" }, () => {
          return Str.Eq.equals(addr.value, "FF:FF:FF:FF:FF:FF:FF:FF");
        })
        .with({ _tag: "eight_groups_by_hyphen" }, () => {
          return Str.Eq.equals(addr.value, "FF-FF-FF-FF-FF-FF-FF-FF");
        })
        .with({ _tag: "four_groups_by_dot" }, () => {
          return Str.Eq.equals(addr.value, "FFFF.FFFF.FFFF.FFFF");
        })
        .exhaustive();
    })
    .exhaustive();
}
