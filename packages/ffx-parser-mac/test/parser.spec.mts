import { ffxParserMac } from "../src/lib/parser.mjs";

describe("ffxParserMac", () => {
  it("should work", () => {
    expect(ffxParserMac()).toEqual("ffx-parser-mac");
  });
});
