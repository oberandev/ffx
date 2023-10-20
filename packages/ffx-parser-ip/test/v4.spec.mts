import * as fc from "fast-check";
import * as Str from "fp-ts/string";

import { parse } from "../src/lib/v4.mjs";

describe("parse", () => {
  it("should handle all possible valid values", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (o1, o2, o3, o4) => {
          const possibleIp: string = `${o1}.${o2}.${o3}.${o4}`;

          expect(parse(possibleIp)).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "ip_v4",
              value: possibleIp,
            },
          });
        },
      ),
    );
  });

  it("should handle all non-zero invalid values", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9 }), (short) => {
        expect(parse(`0${short}.0.0.0`)).toStrictEqual({
          _tag: "Left",
          left: `Expected "." at position 2 but found "${short}"`,
        });

        expect(parse(`0.0${short}.0.0`)).toStrictEqual({
          _tag: "Left",
          left: `Expected "." at position 4 but found "${short}"`,
        });

        expect(parse(`0.0.0${short}.0`)).toStrictEqual({
          _tag: "Left",
          left: `Expected "." at position 6 but found "${short}"`,
        });

        expect(parse(`0.0.0.0${short}`)).toStrictEqual({
          _tag: "Left",
          left: `Expected end of string at position 8 but found "${short}"`,
        });
      }),
    );
  });

  it("should handle invalid octets with too few digits", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (o1, o2, o3, o4) => {
          expect(parse(`.${o2}.${o3}.${o4}`)).toStrictEqual({
            _tag: "Left",
            left: `Expected octet to be 1-3 digit(s) at position 1 but found "."`,
          });

          expect(parse(`${o1}..${o3}.${o4}`)).toStrictEqual({
            _tag: "Left",
            left: `Expected octet to be 1-3 digit(s) at position ${
              Str.size(String(o1)) + 2
            } but found "."`,
          });

          expect(parse(`${o1}.${o2}..${o4}`)).toStrictEqual({
            _tag: "Left",
            left: `Expected octet to be 1-3 digit(s) at position ${
              Str.size(String(o1)) + Str.size(String(o2)) + 3
            } but found "."`,
          });

          expect(parse(`${o1}.${o2}.${o3}.`)).toStrictEqual({
            _tag: "Left",
            left: `Expected octet to be 1-3 digit(s) at position ${
              Str.size(String(o1)) + Str.size(String(o2)) + Str.size(String(o3)) + 4
            } but found "undefined"`,
          });
        },
      ),
    );
  });

  it("should handle invalid octets with too many digits", () => {
    expect(parse("1922.168.1.1")).toStrictEqual({
      _tag: "Left",
      left: `Expected "." at position 4 but found "2"`,
    });

    expect(parse("192.1688.1.1")).toStrictEqual({
      _tag: "Left",
      left: `Expected "." at position 8 but found "8"`,
    });

    expect(parse("192.168.1111.1")).toStrictEqual({
      _tag: "Left",
      left: `Expected "." at position 12 but found "1"`,
    });

    expect(parse("192.168.1.1111")).toStrictEqual({
      _tag: "Left",
      left: `Expected end of string at position 14 but found "1"`,
    });
  });
});
