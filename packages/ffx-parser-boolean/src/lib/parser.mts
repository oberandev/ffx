import { Traversable } from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import * as P from "parser-ts/lib/Parser.js";
import { ParseResult } from "parser-ts/lib/ParseResult.js";
import * as S from "parser-ts/lib/string.js";

export function runParser(input: string): ParseResult<string, boolean> {
  const parser = pipe(
    S.oneOf(Traversable)(["t", "f", "y", "n", "1", "0", "on", "off", "yes", "no", "true", "false"]),
    P.map((val) => {
      if (
        val === "t" ||
        val === "y" ||
        val === "1" ||
        val === "on" ||
        val === "yes" ||
        val === "true"
      ) {
        return true;
      } else {
        return false;
      }
    }),
  );

  return S.run(input)(parser);
}

/**
 * Parse a string into a possible Flatfile boolean.
 *
 * @example
 *
 * ```ts
 * import { parse } from "@obera/ffx-parser-boolean";
 * ```
 *
 * @since 0.1.0
 */
export function parse(input: string) {}
