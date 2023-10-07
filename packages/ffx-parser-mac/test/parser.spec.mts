import { match } from "ts-pattern";

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
        _tag: "ok",
        value: {
          _tag: "ip_v4",
          value: {
            _tag: "six_groups_by_colon",
            value: "ff:ff:ff:ff:ff:ff",
          },
        },
      });
    });

    it("should handle SixGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff");

      expect(result).toStrictEqual({
        _tag: "ok",
        value: {
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
        _tag: "ok",
        value: {
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
        _tag: "ok",
        value: {
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
        _tag: "ok",
        value: {
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
        _tag: "ok",
        value: {
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

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });

    it("should handle SixGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff");

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });

    it("should handle ThreeGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff");

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });

    it("should handle EightGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff:ff:ff");

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });

    it("should handle EightGroupsByHyphen", () => {
      const result = parse("ff-ff-ff-ff-ff-ff-ff-ff");

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });

    it("should handle FourGroupsByDot", () => {
      const result = parse("ffff.ffff.ffff.ffff");

      match(result)
        .with({ _tag: "err" }, ({ value: err }) => {
          expect.fail(err);
        })
        .with({ _tag: "ok" }, ({ value: mac }) => {
          expect(isBroadcast(mac)).toBe(true);
        })
        .exhaustive();
    });
  });
});
