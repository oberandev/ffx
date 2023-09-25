import { api } from "./api.mjs";

describe("api", () => {
  it("should work", () => {
    expect(api()).toEqual("api");
  });
});
