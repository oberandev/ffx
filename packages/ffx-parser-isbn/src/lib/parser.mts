import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
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

export interface ISBN10 {
  readonly _tag: "isbn10";
  readonly value: string;
}

export interface ISBN13 {
  readonly _tag: "isbn13";
  readonly value: string;
}

export type ISBN = ISBN10 | ISBN13;

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
        const digits: string = Str.replace(/\-/g, "")(value);

        return isValid(digits)
          ? Str.size(digits) === 10
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
  const cleaned = pipe(input, Str.replace(/\-/g, ""), Str.split(""));

  return cleaned.length === 10
    ? pipe(
        cleaned,
        RNEA.map((str: string) => Number(str)),
        RNEA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
          return acc + (idx + 1) * cur;
        }),
        (total) => total % 11 === 0,
      )
    : pipe(
        cleaned,
        RNEA.map((str: string) => Number(str)),
        RNEA.reduceWithIndex<number, number>(0, (idx, acc, cur) => {
          return acc + (idx % 2 === 0 ? 1 : 3) * cur;
        }),
        (total) => total % 10 === 0,
      );
}

/**
 * Perform modular arithmetic to calculate the checksum digit.
 *
 * @internal
 */
function calculateChecksumDigit(digits: ReadonlyArray<number>): number {
  return RA.size(digits) === 9
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

      const newChecksum: number = pipe(
        Str.Monoid.concat("978", isbn.value),
        Str.replace(/\-/g, ""),
        Str.split(""),
        (ds) => RNEA.init(ds),
        RA.map((str: string) => Number(str)),
        (digits) => calculateChecksumDigit(digits),
      );

      const isbn13WithoutChecksum: string = pipe(
        isbn.value,
        Str.slice(0, Str.size(isbn.value) - 1),
        (str) => `978${maybeHyphen}${str}`,
      );

      return {
        _tag: "isbn13",
        value: `${isbn13WithoutChecksum}${newChecksum}`,
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
export function downConvert(input: ISBN): O.Option<ISBN> {
  return match(input)
    .with({ _tag: "isbn10" }, (isbn): O.Option<ISBN> => O.some(isbn))
    .with({ _tag: "isbn13" }, (isbn): O.Option<ISBN> => {
      if (!Str.startsWith("978")(isbn.value)) {
        return O.none;
      }

      const cleaned: string = pipe(isbn.value, Str.replace(/^978\-?/g, ""));

      const newChecksum: number = pipe(
        cleaned,
        Str.replace(/\-/g, ""),
        Str.split(""),
        (ds) => RNEA.init(ds),
        RA.map((str: string) => Number(str)),
        (digits) => calculateChecksumDigit(digits),
      );

      const isbn10WithoutChecksum: string = pipe(cleaned, Str.slice(0, Str.size(cleaned) - 1));

      return O.some({
        _tag: "isbn10",
        value: `${isbn10WithoutChecksum}${newChecksum}`,
      });
    })

    .exhaustive();
}
