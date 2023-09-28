import { api } from "../src/lib/api.mjs";

describe("api", () => {
  it("should work", () => {
    expect(api()).toEqual("api");
  });
});
