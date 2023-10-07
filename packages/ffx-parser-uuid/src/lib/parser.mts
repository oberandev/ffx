import * as E from "fp-ts/Either";
import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
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

export interface UUID extends N.Newtype<{ readonly UUID: unique symbol }, string> {}

export const isoUUID: Iso<UUID, string> = N.iso<UUID>();

const eqUUID: Eq.Eq<UUID> = N.getEq<UUID>(Str.Eq);

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

// ==================
//       Main
// ==================

function isHexDigit(c: C.Char): boolean {
  return "0123456789abcdef".indexOf(c.toLowerCase()) !== -1;
}

const hexDigit: P.Parser<C.Char, C.Char> = P.expected(P.sat(isHexDigit), "a hex digit");

const hyphen: P.Parser<string, string> = C.char("-");

const chunkN = (length: number): P.Parser<string, string> =>
  S.fold(Array.from({ length }, () => hexDigit));
const chunk4 = chunkN(4);
const chunk8 = chunkN(8);
const chunk12 = chunkN(12);

export function runParser(input: string): ParseResult<string, UUID> {
  const parser = pipe(
    chunk8,
    P.bindTo("c1"),
    P.apFirst(hyphen),
    P.bind("c2", () => chunk4),
    P.apFirst(hyphen),
    P.bind("c3", () => chunk4),
    P.apFirst(hyphen),
    P.bind("c4", () => chunk4),
    P.apFirst(hyphen),
    P.bind("c5", () => chunk12),
    P.apFirst(P.eof()),
    P.map((chunks) => pipe(Object.values(chunks), RA.intercalate(Str.Monoid)("-"), isoUUID.wrap)),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible uuid.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@oberan/ffx-parser-uuid";
 *
 * const result = parse("23d57c30-afe7-11e4-ab7d-12e3f512a338");
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string): Result<UUID, string> {
  return pipe(
    runParser(input),
    E.matchW(
      ({ expected, input }) => {
        const customErrorMsg: string = `Expected ${expected.join(" ")} at position ${
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
 *  Opinionated format - convert to lowercase.
 *
 * @example
 *
 * ```ts
 * import { format } from "@oberan/ffx-parser-uuid";
 *
 * format(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function format(uuid: UUID): UUID {
  return pipe(uuid, isoUUID.modify(Str.toLowerCase));
}

/**
 *  Test for the special case of the "max" UUID - `FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF`
 *
 * @example
 *
 * ```ts
 * import { isMax } from "@oberan/ffx-parser-uuid";
 *
 * isMax(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function isMax(uuid: UUID): boolean {
  return eqUUID.equals(uuid, isoUUID.wrap("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"));
}

/**
 *  Test for the special case of the "nil" UUID - `00000000-0000-0000-0000-000000000000`
 *
 * @example
 *
 * ```ts
 * import { isNil } from "@oberan/ffx-parser-uuid";
 *
 * isNil(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function isNil(uuid: UUID): boolean {
  return eqUUID.equals(uuid, isoUUID.wrap("00000000-0000-0000-0000-000000000000"));
}

/**
 *  Unwrap a UUID type.
 *
 * @example
 *
 * ```ts
 * import { unwrap } from "@oberan/ffx-parser-uuid";
 *
 * unwrap(uuid);
 * ```
 *
 * @since 0.1.0
 */
export function unwrap(uuid: UUID): string {
  return isoUUID.unwrap(uuid);
}
