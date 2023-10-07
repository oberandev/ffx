import { parse, runParser } from "../src/lib/parser.mjs";

describe("Boolean", () => {
  describe("runParser()", () => {
    it("[shortform] should handle 't'", () => {
      const parserResult = runParser("t");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["t"],
            cursor: 1,
          },
          start: {
            buffer: ["t"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[shortform] should handle 'f'", () => {
      const parserResult = runParser("f");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["f"],
            cursor: 1,
          },
          start: {
            buffer: ["f"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[shortform] should handle 'y'", () => {
      const parserResult = runParser("y");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["y"],
            cursor: 1,
          },
          start: {
            buffer: ["y"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[shortform] should handle 'n'", () => {
      const parserResult = runParser("n");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["n"],
            cursor: 1,
          },
          start: {
            buffer: ["n"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[shortform] should handle '1'", () => {
      const parserResult = runParser("1");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["1"],
            cursor: 1,
          },
          start: {
            buffer: ["1"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[shortform] should handle '0'", () => {
      const parserResult = runParser("0");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["0"],
            cursor: 1,
          },
          start: {
            buffer: ["0"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[longform] should handle 'on'", () => {
      const parserResult = runParser("on");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["o", "n"],
            cursor: 2,
          },
          start: {
            buffer: ["o", "n"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[longform] should handle 'off'", () => {
      const parserResult = runParser("off");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["o", "f", "f"],
            cursor: 3,
          },
          start: {
            buffer: ["o", "f", "f"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[longform] should handle 'yes'", () => {
      const parserResult = runParser("yes");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["y", "e", "s"],
            cursor: 3,
          },
          start: {
            buffer: ["y", "e", "s"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[longform] should handle 'no'", () => {
      const parserResult = runParser("no");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["n", "o"],
            cursor: 2,
          },
          start: {
            buffer: ["n", "o"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[longform] should handle 'true'", () => {
      const parserResult = runParser("true");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["t", "r", "u", "e"],
            cursor: 4,
          },
          start: {
            buffer: ["t", "r", "u", "e"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("[longform] should handle 'false'", () => {
      const parserResult = runParser("false");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          next: {
            buffer: ["f", "a", "l", "s", "e"],
            cursor: 5,
          },
          start: {
            buffer: ["f", "a", "l", "s", "e"],
            cursor: 0,
          },
          value: false,
        },
      });
    });

    it("[invalid] should handle 'tr'", () => {
      const parserResult = runParser("tr");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["t", "r"],
            cursor: 2,
          },
          expected: ['"true"'],
          fatal: false,
        },
      });
    });

    it("[invalid] should handle 'ye'", () => {
      const parserResult = runParser("ye");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["y", "e"],
            cursor: 2,
          },
          expected: ['"yes"'],
          fatal: false,
        },
      });
    });

    it("[invalid] should handle '10'", () => {
      const parserResult = runParser("10");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["1", "0"],
            cursor: 1,
          },
          expected: ["end of string"],
          fatal: false,
        },
      });
    });

    it("[invalid] should handle '01'", () => {
      const parserResult = runParser("01");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["0", "1"],
            cursor: 1,
          },
          expected: ["end of string"],
          fatal: false,
        },
      });
    });

    it("[invalid] should handle 'yess'", () => {
      const parserResult = runParser("yess");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["y", "e", "s", "s"],
            cursor: 3,
          },
          expected: ["end of string"],
          fatal: false,
        },
      });
    });

    it("[invalid] should handle 'noo'", () => {
      const parserResult = runParser("noo");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        left: {
          input: {
            buffer: ["n", "o", "o"],
            cursor: 2,
          },
          expected: ["end of string"],
          fatal: false,
        },
      });
    });
  });

  describe("parser()", () => {
    it("[shortform] should handle 't'", () => {
      const result = parse("t");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[shortform] should handle 'f'", () => {
      const result = parse("f");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[shortform] should handle 'y'", () => {
      const result = parse("y");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[shortform] should handle 'n'", () => {
      const result = parse("n");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[shortform] should handle '1'", () => {
      const result = parse("1");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[shortform] should handle '0'", () => {
      const result = parse("0");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[longform] should handle 'on'", () => {
      const result = parse("on");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[longform] should handle 'off'", () => {
      const result = parse("off");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[longform] should handle 'yes'", () => {
      const result = parse("yes");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[longform] should handle 'no'", () => {
      const result = parse("no");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[longform] should handle 'true'", () => {
      const result = parse("true");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("[longform] should handle 'false'", () => {
      const result = parse("false");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: false,
      });
    });

    it("[invalid] should handle 'tr'", () => {
      const result = parse("tr");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected "true" but found "tr"',
      });
    });

    it("[invalid] should handle 'ye'", () => {
      const result = parse("ye");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected "yes" but found "ye"',
      });
    });

    it("[invalid] should handle '10'", () => {
      const result = parse("10");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected end of string but found "10"',
      });
    });

    it("[invalid] should handle '01'", () => {
      const result = parse("01");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected end of string but found "01"',
      });
    });

    it("[invalid] should handle 'yess'", () => {
      const result = parse("yess");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected end of string but found "yess"',
      });
    });

    it("[invalid] should handle 'noo'", () => {
      const result = parse("noo");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: 'Expected end of string but found "noo"',
      });
    });
  });
});
