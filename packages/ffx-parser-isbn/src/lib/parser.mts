import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as Str from "fp-ts/string";
import * as C from "parser-ts/char";
import * as P from "parser-ts/Parser";
import { ParseResult } from "parser-ts/ParseResult";
import * as S from "parser-ts/string";
import { match } from "ts-pattern";

// ==================
//       Types
// ==================

interface ISBN10 {
  readonly _tag: "isbn10";
  readonly value: string;
}

interface ISBN13 {
  readonly _tag: "isbn13";
  readonly value: string;
}

type ISBN = ISBN10 | ISBN13;

// ==================
//       Main
// ==================

const digit = C.digit;

const digitOrHyphen = C.oneOf("0123456789-");

export function runParser(input: string): ParseResult<string, string> {
  const parser = pipe(
    digit,
    P.bindTo("d1"),
    P.bind("rest", () => S.many1(digitOrHyphen)),
    P.apFirst(P.eof()),
    P.map((ds) => pipe(Object.values(ds).join(""))),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible isbn10 or isbn13.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-isbn";
 *
 * const result = parse("978-3-16-148410-0");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): E.Either<string, ISBN> {
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
        const cleaned = Str.replace(/\-/g, "")(value);

        return isValid(cleaned)
          ? Str.size(cleaned) === 10
            ? E.right({ _tag: "isbn10", value })
            : E.right({ _tag: "isbn13", value })
          : E.left("ISBN failed checksum validation");
      },
    ),
  );
}

// ==================
//      Helpers
// ==================

/**
 * Perform modular arithmetic to verify a given input can be considered a valid ISBN.
 *
 * @internal
 */
function isValid(input: string): boolean {
  const cleaned = pipe(input, Str.replace(/\-/g, ""), Str.split("")); // returns RNEA

  if (cleaned.length === 10) {
    // (x1 + 2*x2 + 3*x3 + 4*x4 + 5*x5 + 6*x6 + 7*x7 + 8*x8 + 9*x9 + 10*x10) === 0 modulo 11
    return pipe(
      cleaned,
      RNEA.map((str: string) => Number(str)),
      RNEA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
        return acc + (idx + 1) * cur;
      }),
      (total) => total % 11 === 0,
    );
  }

  if (cleaned.length === 13) {
    // (x1 + 3*x2 + x3 + 3*x4 + x5 + 3*x6 + x7 + 3*x8 + x9 + 3*x10 + x11 + 3*x12 + x13) === 0 modulo 10
    return pipe(
      cleaned,
      RNEA.map((str: string) => Number(str)),
      RNEA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
        return acc + (idx % 2 === 0 ? 1 : 3) * cur;
      }),
      (total) => total % 10 === 0,
    );
  }

  return false;
}

/**
 * Perform modular arithmetic to calculate the checksum digit.
 *
 * @internal
 */
export function calculateChecksumDigit(digits: ReadonlyArray<number>): number {
  return RA.size(digits) === 10
    ? pipe(
        digits,
        RA.reverse,
        RA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
          return acc + (idx + 2) * cur;
        }),
        (total) => (11 - (total % 11)) % 11,
      )
    : pipe(
        digits,
        RA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
          return acc + (idx % 2 === 0 ? 1 : 3) * cur;
        }),
        (total) => 10 - (total % 10),
      );
}

/**
 * Safely convert a 10-digit ISBN to a 13-digit ISBN.
 *
 * @example
 *
 * ```ts
 * import { upConvert } from "@oberan/ffx-parser-isbn";
 *
 * upConvert(isbn);
 * ```
 *
 * @since 0.1.0
 */
export function upConvert(input: ISBN): ISBN {
  return match(input)
    .with({ _tag: "isbn10" }, (isbn): ISBN13 => {
      const maybeHyphen: string = Str.includes("-")(isbn.value) ? "-" : "";

      const digits: ReadonlyArray<number> = pipe(
        Str.Monoid.concat("978", isbn.value),
        Str.replace(/\-/g, ""),
        Str.split(""),
        (ds) => RNEA.init(ds),
        RA.map((str: string) => Number(str)),
      );

      const checksumDigit: number = calculateChecksumDigit(digits);

      const digitsAllButLast: string = Str.slice(0, Str.size(isbn.value) - 1)(isbn.value);

      return {
        _tag: "isbn13",
        value: `978${maybeHyphen}${digitsAllButLast}${checksumDigit}`,
      };
    })
    .with({ _tag: "isbn13" }, (isbn): ISBN13 => isbn)
    .exhaustive();
}

/**
 * Safely convert a 13-digit ISBN to a 10-digit ISBN.
 *
 * @example
 *
 * ```ts
 * import { downConvert } from "@oberan/ffx-parser-isbn";
 *
 * downConvert(isbn);
 * ```
 *
 * @since 0.1.0
 */
export function downConvert(input: ISBN): ISBN {
  return match(input)
    .with({ _tag: "isbn10" }, (isbn): ISBN10 => isbn)
    .with({ _tag: "isbn13" }, (): ISBN10 => {
      // remove "978" if it exists
      // recalculate checksum digit and append
      return {
        _tag: "isbn10",
        value: input.value,
      };
    })
    .exhaustive();
}
