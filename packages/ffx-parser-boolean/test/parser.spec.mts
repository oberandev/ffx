import { runParser } from "../src/lib/parser.mjs";

describe("Boolean", () => {
  describe("All possible valid values", () => {
    it("should handle 't' shortform", () => {
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

    it("should handle 'f' shortform", () => {
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

    it("should handle 'y' shortform", () => {
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

    it("should handle 'n' shortform", () => {
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

    it("should handle '1' shortform", () => {
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

    it("should handle '0' shortform", () => {
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

    it("should handle 'on' longform", () => {
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

    it("should handle 'off' longform", () => {
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

    it("should handle 'yes' longform", () => {
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

    it("should handle 'no' longform", () => {
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

    it("should handle 'true' longform", () => {
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

    it("should handle 'false' longform", () => {
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
  });

  describe("Bad values", () => {
    it.only("should handle 'tr'", () => {
      const parserResult = runParser("tr");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["t", "r"],
            cursor: 1,
          },
          start: {
            buffer: ["t", "r"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("should handle 'ye'", () => {
      const parserResult = runParser("ye");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["y", "e"],
            cursor: 1,
          },
          start: {
            buffer: ["y", "e"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("should handle '10'", () => {
      const parserResult = runParser("10");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["1", "0"],
            cursor: 1,
          },
          start: {
            buffer: ["1", "0"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("should handle '01'", () => {
      const parserResult = runParser("01");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["0", "1"],
            cursor: 1,
          },
          start: {
            buffer: ["0", "1"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("should handle 'yess'", () => {
      const parserResult = runParser("yess");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["y", "e", "s", "s"],
            cursor: 4,
          },
          start: {
            buffer: ["y", "e", "s", "s"],
            cursor: 0,
          },
          value: true,
        },
      });
    });

    it("should handle 'noo'", () => {
      const parserResult = runParser("noo");

      expect(parserResult).toStrictEqual({
        _tag: "Left",
        right: {
          next: {
            buffer: ["n", "o", "o"],
            cursor: 2,
          },
          start: {
            buffer: ["n", "o", "o"],
            cursor: 0,
          },
          value: true,
        },
      });
    });
  });
});
