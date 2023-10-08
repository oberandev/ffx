import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
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

export interface ISBN extends N.Newtype<{ readonly ISBN: unique symbol }, string> {}

export const isoISBN: Iso<ISBN, string> = N.iso<ISBN>();

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
        return isValid(value)
          ? E.right(isoISBN.wrap(value))
          : E.left("ISBN failed checksum validation");
      },
    ),
  );
}

// ==================
//      Helpers
// ==================

/**
 *
 *
 * @example
 *
 * ```ts
 * import { isValid } from "@oberan/ffx-parser-isbn";
 *
 * isValid(isbn);
 * ```
 *
 * @since 0.1.0
 */
function isValid(input: string): boolean {
  const cleaned = pipe(
    input,
    Str.split(""),
    RA.filter((char) => char !== "-"),
  );

  if (RA.size(cleaned) === 10) {
    // (x1 + 2*x2 + 3*x3 + 4*x4 + 5*x5 + 6*x6 + 7*x7 + 8*x8 + 9*x9 + 10*x10) === 0 modulo 11
    return pipe(
      cleaned,
      RA.map((str: string) => Number(str)),
      RA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
        return acc + (idx + 1) * cur;
      }),
      (total) => total % 11 === 0,
    );
  }

  if (RA.size(cleaned) === 13) {
    // (x1 + 3*x2 + x3 + 3*x4 + x5 + 3*x6 + x7 + 3*x8 + x9 + 3*x10 + x11 + 3*x12 + x13) === 0 modulo 10
    return pipe(
      cleaned,
      RA.map((str: string) => Number(str)),
      RA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
        return acc + (idx % 2 === 0 ? 1 : 3) * cur;
      }),
      (total) => total % 10 === 0,
    );
  }

  return false;
}

/**
 * Convert a 10-digit ISBN to a 13-digit ISBN.
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
  return isoISBN.modify((isbn) => Str.Monoid.concat("978-", isbn))(input);
}

/**
 * Convert a 13-digit ISBN to a 10-digit ISBN.
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
export function downConvert(input: ISBN): O.Option<ISBN> {
  return O.some(input);
}

/**
 * Unwrap an ISBN type.
 *
 * @example
 *
 * ```ts
 * import { unwrap } from "@oberan/ffx-parser-isbn";
 *
 * unwrap(isbn);
 * ```
 *
 * @since 0.1.0
 */
export function unwrap(isbn: ISBN): string {
  return isoISBN.unwrap(isbn);
}
