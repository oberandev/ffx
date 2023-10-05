import { ffxParserBoolean } from "../src/lib/parser.mjs";

describe("ffxParserBoolean", () => {
  it("should work", () => {
    expect(ffxParserBoolean()).toEqual("ffx-parser-boolean");
  });
});
