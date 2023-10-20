import * as fc from "fast-check";

import { UUID, format, isMax, isNil, isoUUID, parse, unwrap } from "../src/lib/parser.mjs";

describe("UUID", () => {
  it("should handle a `parse` success", () => {
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
    const acutal: UUID = format(isoUUID.wrap("2357C30-AFE7-11E4-AB7D-12E3F512A338"));
    const expected: UUID = isoUUID.wrap("2357c30-afe7-11e4-ab7d-12e3f512a338");

    expect(acutal).toStrictEqual(expected);
  });

  it("should handle `isMax` success", () => {
    const actual: UUID = isoUUID.wrap("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF");
    const expected: boolean = true;

    expect(isMax(actual)).toBe(expected);
  });

  it("should handle `isMax` failure", () => {
    const actual: UUID = isoUUID.wrap("123e4567-e89b-12d3-a456-426614174000");
    const expected: boolean = false;

    expect(isMax(actual)).toBe(expected);
  });

  it("should handle `isNil` success", () => {
    const actual: UUID = isoUUID.wrap("00000000-0000-0000-0000-000000000000");
    const expected: boolean = true;

    expect(isNil(actual)).toBe(expected);
  });

  it("should handle `isNil` failure", () => {
    const actual: UUID = isoUUID.wrap("123e4567-e89b-12d3-a456-426614174000");
    const expected: boolean = false;

    expect(isNil(actual)).toBe(expected);
  });

  it("should handle `unwrap`", () => {
    const actual: UUID = isoUUID.wrap("23d57c30-afe7-11e4-ab7d-12e3f512a338");
    const expected: string = "23d57c30-afe7-11e4-ab7d-12e3f512a338";

    expect(unwrap(actual)).toStrictEqual(expected);
  });
});
