import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

import { parse, runParser } from "../src/lib/parser.mjs";

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
          "93-86954-21-4",
          "0-943396-04-2",
        ],
        RA.map((input) => {
          const result = parse(input);

          expect(result).toStrictEqual({
            _tag: "Right",
            right: input,
          });
        }),
      );
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
            right: input,
          });
        }),
      );
    });
  });
});
