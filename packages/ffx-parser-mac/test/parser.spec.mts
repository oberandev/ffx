import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { isBroadcast, parse, runParser } from "../src/lib/parser.mjs";

describe("Mac Address", () => {
  describe("runParser()", () => {
    it("should handle SixGroupsByColon", () => {
      const parserResult = runParser("ff:ff:ff:ff:ff:ff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v4",
            value: {
              _tag: "six_groups_by_colon",
              value: "ff:ff:ff:ff:ff:ff",
            },
          },
          next: {
            buffer: [
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
            ],
            cursor: 17,
          },
          start: {
            buffer: [
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
            ],
            cursor: 0,
          },
        },
      });
    });

    it("should handle SixGroupsByHyphen", () => {
      const parserResult = runParser("ff-ff-ff-ff-ff-ff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v4",
            value: {
              _tag: "six_groups_by_hyphen",
              value: "ff-ff-ff-ff-ff-ff",
            },
          },
          next: {
            buffer: [
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
            ],
            cursor: 17,
          },
          start: {
            buffer: [
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
            ],
            cursor: 0,
          },
        },
      });
    });

    it("should handle ThreeGroupsByDot", () => {
      const parserResult = runParser("ffff.ffff.ffff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v4",
            value: {
              _tag: "three_groups_by_dot",
              value: "ffff.ffff.ffff",
            },
          },
          next: {
            buffer: ["f", "f", "f", "f", ".", "f", "f", "f", "f", ".", "f", "f", "f", "f"],
            cursor: 14,
          },
          start: {
            buffer: ["f", "f", "f", "f", ".", "f", "f", "f", "f", ".", "f", "f", "f", "f"],
            cursor: 0,
          },
        },
      });
    });

    it("should handle EightGroupsByColon", () => {
      const parserResult = runParser("ff:ff:ff:ff:ff:ff:ff:ff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v6",
            value: {
              _tag: "eight_groups_by_colon",
              value: "ff:ff:ff:ff:ff:ff:ff:ff",
            },
          },
          next: {
            buffer: [
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
            ],
            cursor: 23,
          },
          start: {
            buffer: [
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
              ":",
              "f",
              "f",
            ],
            cursor: 0,
          },
        },
      });
    });

    it("should handle EightGroupsByHyphen", () => {
      const parserResult = runParser("ff-ff-ff-ff-ff-ff-ff-ff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v6",
            value: {
              _tag: "eight_groups_by_hyphen",
              value: "ff-ff-ff-ff-ff-ff-ff-ff",
            },
          },
          next: {
            buffer: [
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
            ],
            cursor: 23,
          },
          start: {
            buffer: [
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
              "-",
              "f",
              "f",
            ],
            cursor: 0,
          },
        },
      });
    });

    it("should handle FourGroupsByDot", () => {
      const parserResult = runParser("ffff.ffff.ffff.ffff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v6",
            value: {
              _tag: "four_groups_by_dot",
              value: "ffff.ffff.ffff.ffff",
            },
          },
          next: {
            buffer: [
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
            ],
            cursor: 19,
          },
          start: {
            buffer: [
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
              ".",
              "f",
              "f",
              "f",
              "f",
            ],
            cursor: 0,
          },
        },
      });
    });
  });

  describe("parser()", () => {
    it("should handle SixGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v4",
          value: {
            _tag: "six_groups_by_colon",
            value: "ff:ff:ff:ff:ff:ff",
          },
        },
      });
    });

    it("should handle SixGroupsByColon failure", () => {
      const result = parse("pf:ff:ff:ff:ff:ff");

      expect(result).toStrictEqual({
        _tag: "Left",
        left: `Expected a hex digit at position 1 but found "p"`,
      });
    });

    it("should handle SixGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v4",
          value: {
            _tag: "six_groups_by_hyphen",
            value: "ff-ff-ff-ff-ff-ff",
          },
        },
      });
    });

    it("should handle ThreeGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v4",
          value: {
            _tag: "three_groups_by_dot",
            value: "ffff.ffff.ffff",
          },
        },
      });
    });

    it("should handle EightGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff:ff:ff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v6",
          value: {
            _tag: "eight_groups_by_colon",
            value: "ff:ff:ff:ff:ff:ff:ff:ff",
          },
        },
      });
    });

    it("should handle EightGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff-ff-ff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v6",
          value: {
            _tag: "eight_groups_by_hyphen",
            value: "ff-ff-ff-ff-ff-ff-ff-ff",
          },
        },
      });
    });

    it("should handle FourGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff.ffff");

      expect(result).toStrictEqual({
        _tag: "Right",
        right: {
          _tag: "ip_v6",
          value: {
            _tag: "four_groups_by_dot",
            value: "ffff.ffff.ffff.ffff",
          },
        },
      });
    });
  });

  describe("isBroadcast()", () => {
    it("should handle SixGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });

    it("should handle SixGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });

    it("should handle ThreeGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });

    it("should handle EightGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff:ff:ff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });

    it("should handle EightGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff-ff-ff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });

    it("should handle FourGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff.ffff");

      pipe(
        result,
        E.map((macAddr) => {
          expect(isBroadcast(macAddr)).toBe(true);
        }),
      );
    });
  });
});
