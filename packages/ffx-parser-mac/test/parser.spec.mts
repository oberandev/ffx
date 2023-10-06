import { parse, runParser } from "../src/lib/parser.mjs";

describe("Mac Address", () => {
  describe("runParser()", () => {
    it("should handle SixGroupsByColon", () => {
      const parserResult = runParser("ff:ff:ff:ff:ff:ff");

      expect(parserResult).toStrictEqual({
        _tag: "Right",
        right: {
          value: {
            _tag: "ip_v4",
            data: {
              _tag: "six_groups_by_colon",
              data: "f",
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
            cursor: 1,
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

    it("should handle SixGroupsByHyphen", () => {});
    it("should handle ThreeGroupsByDot", () => {});
    it("should handle EightGroupsByColon", () => {});
    it("should handle EightGroupsByHyphen", () => {});
    it("should handle FourGroupsByDot", () => {});
  });

  describe("parser()", () => {
    it("should handle SixGroupsByColon", () => {
      const result = parse("ff:ff:ff:ff:ff:ff");

      expect(result).toStrictEqual({
        _tag: "ok",
        value: {
          _tag: "ip_v4",
          data: {
            _tag: "six_groups_by_colon",
            data: "f",
          },
        },
      });
    });

    it("should handle SixGroupsByHyphen", () => {});
    it("should handle ThreeGroupsByDot", () => {});
    it("should handle EightGroupsByColon", () => {});
    it("should handle EightGroupsByHyphen", () => {});
    it("should handle FourGroupsByDot", () => {});
  });
});
