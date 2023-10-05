import { format, isMax, isNil, isoUUID, parse } from "../src/lib/parser.mjs";

describe("UUID", () => {
  it("should handle `parse`", () => {
    parse(
      (errors) => assert.fail(errors),
      (uuid) => expect(uuid).toStrictEqual("23d57c30-afe7-11e4-ab7d-12e3f512a338"),
    )("23d57c30-afe7-11e4-ab7d-12e3f512a338");

    parse(
      (errors) => expect(errors).toStrictEqual("a hex digit"),
      (_uuid) => assert.fail("uh oh"),
    )("-afe7-11e4-ab7d-12e3f512a338");
  });

  it("should handle `format`", () => {
    expect(format(isoUUID.wrap("2357C30-AFE7-11E4-AB7D-12E3F512A338"))).toStrictEqual(
      "2357c30-afe7-11e4-ab7d-12e3f512a338",
    );

    expect(format(isoUUID.wrap("2357C30-afe7-11E4-ab7d-12E3F512A338"))).toStrictEqual(
      "2357c30-afe7-11e4-ab7d-12e3f512a338",
    );
  });

  it("should handle `isMax`", () => {
    expect(isMax(isoUUID.wrap("FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF"))).toBe(true);

    expect(isMax(isoUUID.wrap("123e4567-e89b-12d3-a456-426614174000"))).toBe(false);
  });

  it("should handle `isNil`", () => {
    expect(isNil(isoUUID.wrap("00000000-0000-0000-0000-000000000000"))).toBe(true);

    expect(isNil(isoUUID.wrap("123e4567-e89b-12d3-a456-426614174000"))).toBe(false);
  });
});
