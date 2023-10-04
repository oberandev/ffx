import { ffxParserUuid } from "../src/lib/uuid";

describe("ffxParserUuid", () => {
  it("should work", () => {
    expect(ffxParserUuid()).toEqual("ffx-parser-uuid");
  });
});
