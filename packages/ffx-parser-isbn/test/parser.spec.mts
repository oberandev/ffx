import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

import { downConvert, parse, runParser, upConvert } from "../src/lib/parser.mjs";

describe("ISBN", () => {
  describe("runParser()", () => {
    it("should handle valid ISBN-10", () => {
      const result = runParser("0-306-40615-2");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          value: "0-306-40615-2",
          next: {
            buffer: ["0", "-", "3", "0", "6", "-", "4", "0", "6", "1", "5", "-", "2"],
            cursor: 13,
          },
          start: {
            buffer: ["0", "-", "3", "0", "6", "-", "4", "0", "6", "1", "5", "-", "2"],
            cursor: 0,
          },
        },
      });
    });

    it("should handle invalid ISBN-10", () => {
      const result = runParser("-306-40615-2");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["-", "3", "0", "6", "-", "4", "0", "6", "1", "5", "-", "2"],
            cursor: 0,
          },
          expected: ["a digit"],
          fatal: false,
        },
      });
    });

    it("should handle valid ISBN-13", () => {
      const result = runParser("978-0-306-40615-7");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          value: "978-0-306-40615-7",
          next: {
            buffer: [
              "9",
              "7",
              "8",
              "-",
              "0",
              "-",
              "3",
              "0",
              "6",
              "-",
              "4",
              "0",
              "6",
              "1",
              "5",
              "-",
              "7",
            ],
            cursor: 17,
          },
          start: {
            buffer: [
              "9",
              "7",
              "8",
              "-",
              "0",
              "-",
              "3",
              "0",
              "6",
              "-",
              "4",
              "0",
              "6",
              "1",
              "5",
              "-",
              "7",
            ],
            cursor: 0,
          },
        },
      });
    });
  });

  describe("parse()", () => {
    it("should handle valid ISBN-10", () => {
      pipe(
        [
          "99921-58-10-7",
          "9971-5-0210-0",
          "960-425-059-0",
          "80-902734-1-6",
          "85-359-0277-5",
          "1-84356-028-3",
          "0-684-84328-5",
          "0-85131-041-9",
          "9386954214",
          "0943396042",
        ],
        RA.map((input) => {
          const result = parse(input);

          expect(result).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "isbn10",
              value: input,
            },
          });
        }),
      );
    });

    it("should handle invalid parse()", () => {
      const result = parse("-99921-58-10-6");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: `Expected a digit at position 1 but found "-"`,
      });
    });

    it("should handle ISBN-10 failed checksum check", () => {
      const result = parse("99921-58-10-6");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: "ISBN failed checksum validation",
      });
    });

    it("should handle valid ISBN-13", () => {
      pipe(
        [
          "978-0-306-40615-7",
          "978-1-56619-909-4",
          "978-1-4028-9462-6",
          "9781681972718",
          "9781861973719",
        ],
        RA.map((input) => {
          const result = parse(input);

          expect(result).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "isbn13",
              value: input,
            },
          });
        }),
      );
    });

    it("should handle ISBN-13 failed checksum check", () => {
      const result = parse("978-0-306-40615-6");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: "ISBN failed checksum validation",
      });
    });

    it("should handle upConvert()", () => {
      pipe(
        [
          ["99921-58-10-7", "978-99921-58-10-4"],
          ["9971-5-0210-0", "978-9971-5-0210-2"],
          ["960-425-059-0", "978-960-425-059-2"],
          ["80-902734-1-6", "978-80-902734-1-2"],
          ["85-359-0277-5", "978-85-359-0277-8"],
          ["1-84356-028-3", "978-1-84356-028-9"],
          ["0-684-84328-5", "978-0-684-84328-5"],
          ["0-85131-041-9", "978-0-85131-041-1"],
          ["9386954214", "9789386954213"],
          // ["0943396042", "978094339604X"],
        ],
        RA.map(([input, converted]) => {
          const result = pipe(
            parse(input),
            E.map((isbn) => upConvert(isbn)),
          );

          expect(result).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "isbn13",
              value: converted,
            },
          });
        }),
      );
    });

    it("should handle downConvert()", () => {
      pipe(
        [
          ["978-99921-58-10-4", "99921-58-10-7"],
          ["978-9971-5-0210-2", "9971-5-0210-0"],
          ["978-960-425-059-2", "960-425-059-0"],
          ["978-80-902734-1-2", "80-902734-1-6"],
          ["978-85-359-0277-8", "85-359-0277-5"],
          ["978-1-84356-028-9", "1-84356-028-3"],
          ["978-0-684-84328-5", "0-684-84328-5"],
          ["978-0-85131-041-1", "0-85131-041-9"],
          ["9789386954213", "9386954214"],
          // ["978094339604X", "0943396042"],
        ],
        RA.map(([input, converted]) => {
          const result = pipe(
            parse(input),
            E.chain((isbn) => E.fromOption(() => "No equivalent")(downConvert(isbn))),
          );

          expect(result).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "isbn10",
              value: converted,
            },
          });
        }),
      );
    });

    it("should handle downConvert() failure", () => {
      const result = pipe(
        parse("1239386954211"),
        E.chain((isbn) => E.fromOption(() => "No equivalent")(downConvert(isbn))),
      );

      expect(result).toStrictEqual({
        _tag: "Left",
        left: "No equivalent",
      });
    });
  });
});
