import { ffxCli } from "../src/lib/ffx-cli.mjs";

describe("ffxCli", () => {
  it("should work", () => {
    expect(ffxCli()).toEqual("ffx-cli");
  });
});
