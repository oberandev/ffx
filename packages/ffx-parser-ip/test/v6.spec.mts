import * as fc from "fast-check";

import { parse } from "../src/lib/v6.mjs";

describe("parse", () => {
  it("should handle IPv6", () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        fc.hexaString({ minLength: 1, maxLength: 4 }),
        (g1, g2, g3, g4, g5, g6, g7, g8) => {
          const possibleIp: string = `${g1}:${g2}:${g3}:${g4}:${g5}:${g6}:${g7}:${g8}`;

          expect(parse(possibleIp)).toStrictEqual({
            _tag: "Right",
            right: {
              _tag: "ip_v6",
              value: possibleIp,
            },
          });
        },
      ),
    );
  });

  it("should handle invalid hexadecimal digit", () => {
    expect(parse("2001:x:0000:0000:0000:8a2e:0370:7334")).toStrictEqual({
      _tag: "Left",
      left: `Expected group to be 1-4 hexdigit(s) at position 6 but found "x"`,
    });
  });

  it("should handle group with too few hexadecimal digits", () => {
    expect(parse("2001::0000:0000:0000:8a2e:0370:7334")).toStrictEqual({
      _tag: "Left",
      left: `Expected group to be 1-4 hexdigit(s) at position 6 but found ":"`,
    });
  });
});
