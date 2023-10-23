import * as fc from "fast-check";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { format, isMax, isNil, parse, toString } from "../src/lib/parser.mjs";

describe("UUID", () => {
  it("should handle all possible valid values", () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 8, maxLength: 8 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 4, maxLength: 4 }),
        fc.hexaString({ minLength: 12, maxLength: 12 }),
        (c1, c2, c3, c4, c5) => {
          const possibleUuid = `${c1}-${c2}-${c3}-${c4}-${c5}`;

          expect(parse(possibleUuid)).toStrictEqual({
            _tag: "Right",
            right: possibleUuid,
          });
        },
      ),
    );
  });

  it("should handle a `parse` failure", () => {
    const result = parse("-afe7-11e4-ab7d-12e3f512a338");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: `Expected a hex digit at position 1 but found "-"`,
    });
  });

  it("should handle a `parse` failure with a splat instead of a hyphen", () => {
    const result = parse("23d57c30*afe7-11e4-ab7d-12e3f512a338");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: `Expected "-" at position 9 but found "*"`,
    });
  });

  it("should handle `format` with capitalized chars", () => {
    const result = pipe(parse("23D57C30-AFE7-11E4-AB7D-12E3F512A338"), E.map(format));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: "23d57c30-afe7-11e4-ab7d-12e3f512a338",
    });
  });

  it("should handle `isMax` success", () => {
    const result = pipe(parse("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"), E.map(isMax));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("should handle `isMax` failure", () => {
    const result = pipe(parse("123e4567-e89b-12d3-a456-426614174000"), E.map(isMax));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("should handle `isNil` success", () => {
    const result = pipe(parse("00000000-0000-0000-0000-000000000000"), E.map(isNil));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("should handle `isNil` failure", () => {
    const result = pipe(parse("123e4567-e89b-12d3-a456-426614174000"), E.map(isNil));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("should handle `toString`", () => {
    const result = pipe(parse("23d57c30-afe7-11e4-ab7d-12e3f512a338"), E.map(toString));

    expect(result).toStrictEqual({
      _tag: "Right",
      right: "23d57c30-afe7-11e4-ab7d-12e3f512a338",
    });
  });
});
