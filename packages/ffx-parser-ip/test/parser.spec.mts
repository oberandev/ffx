import { parse } from "../src/lib/parser.mjs";

describe("parse", () => {
  it("should work", () => {
    expect(parse()).toEqual("ffx-parser-ip");
  });
});
