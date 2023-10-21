import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { isBroadcast, parse } from "../src/lib/parser.mjs";

describe("Mac Address", () => {
  describe("`parse`", () => {
    it("should handle SixGroupsByColon", () => {
      expect(parse("ff:ff:ff:ff:ff:ff")).toStrictEqual({
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

    it("should handle SixGroupsByHyphen", () => {
      expect(parse("ff-ff-ff-ff-ff-ff")).toStrictEqual({
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
      expect(parse("ffff.ffff.ffff")).toStrictEqual({
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
      expect(parse("ff:ff:ff:ff:ff:ff:ff:ff")).toStrictEqual({
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
      expect(parse("ff-ff-ff-ff-ff-ff-ff-ff")).toStrictEqual({
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
      expect(parse("ffff.ffff.ffff.ffff")).toStrictEqual({
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

    it("should handle invalid digit failure", () => {
      expect(parse("pf:ff:ff:ff:ff:ff")).toStrictEqual({
        _tag: "Left",
        left: `Expected a hex digit at position 1 but found "p"`,
      });
    });
  });

  describe("`isBroadcast`", () => {
    it("should handle SixGroupsByColon", () => {
      const result = pipe(parse("ff:ff:ff:ff:ff:ff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("should handle SixGroupsByHyphen", () => {
      const result = pipe(parse("ff-ff-ff-ff-ff-ff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("should handle ThreeGroupsByDot", () => {
      const result = pipe(parse("ffff.ffff.ffff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("should handle EightGroupsByColon", () => {
      const result = pipe(parse("ff:ff:ff:ff:ff:ff:ff:ff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("should handle EightGroupsByHyphen", () => {
      const result = pipe(parse("ff-ff-ff-ff-ff-ff-ff-ff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });

    it("should handle FourGroupsByDot", () => {
      const result = pipe(parse("ffff.ffff.ffff.ffff"), E.map(isBroadcast));

      expect(result).toStrictEqual({
        _tag: "Right",
        right: true,
      });
    });
  });
});
