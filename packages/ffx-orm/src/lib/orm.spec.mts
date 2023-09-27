import { ffxOrm } from "./orm.mjs";

describe("ffxOrm", () => {
  it("should work", () => {
    expect(ffxOrm()).toEqual("ffx-orm");
  });
});
