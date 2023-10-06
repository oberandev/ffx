import { UUID, format, isMax, isNil, isoUUID, parse, unwrap } from "../src/lib/parser.mjs";

describe("UUID", () => {
  it("should handle a `parse` success", () => {
    const result = parse("23d57c30-afe7-11e4-ab7d-12e3f512a338");

    expect(result).toStrictEqual({
      _tag: "ok",
      value: "23d57c30-afe7-11e4-ab7d-12e3f512a338",
    });
  });

  it("should handle a `parse` failure", () => {
    const result = parse("-afe7-11e4-ab7d-12e3f512a338");

    expect(result).toStrictEqual({
      _tag: "err",
      value: "a hex digit",
    });
  });

  it("should handle a `parse` failure with a splat instead of a hyphen", () => {
    const result = parse("23d57c30*afe7-11e4-ab7d-12e3f512a338");

    expect(result).toStrictEqual({
      _tag: "err",
      value: `"-"`,
    });
  });

  it("should handle `format` when all caps", () => {
    const acutal: UUID = format(isoUUID.wrap("2357C30-AFE7-11E4-AB7D-12E3F512A338"));
    const expected: string = "2357c30-afe7-11e4-ab7d-12e3f512a338";

    expect(acutal).toStrictEqual(expected);
  });

  it("should handle `format` with random caps", () => {
    const acutal: UUID = format(isoUUID.wrap("2357C30-afe7-11E4-ab7d-12E3F512A338"));
    const expected: string = "2357c30-afe7-11e4-ab7d-12e3f512a338";

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

    expect(isMax(actual)).toBe(false);
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
