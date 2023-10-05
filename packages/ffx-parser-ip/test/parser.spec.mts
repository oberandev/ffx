import { ffxParserIp } from "../src/lib/parser.mjs";

describe("ffxParserIp", () => {
  it("should work", () => {
    expect(ffxParserIp()).toEqual("ffx-parser-ip");
  });
});
