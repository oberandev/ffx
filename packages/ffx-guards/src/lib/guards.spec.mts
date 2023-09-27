import { faker } from "@faker-js/faker";

import * as G from "./guards.mjs";

describe("ffx-guards", () => {
  it("isNull()", () => {
    expect(G.isNull(null)).toBe(true);

    expect(G.isNull(false)).toBe(false);
    expect(G.isNull(faker.lorem.words(2))).toBe(false);
    expect(G.isNull(faker.number.int())).toBe(false);
    expect(G.isNull(undefined)).toBe(false);
    expect(G.isNull(faker.date.past())).toBe(false);
    expect(G.isNull({})).toBe(false);
  });

  it("isUndefined()", () => {
    expect(G.isUndefined(undefined)).toBe(true);

    expect(G.isUndefined(false)).toBe(false);
    expect(G.isUndefined(faker.lorem.words(2))).toBe(false);
    expect(G.isUndefined(1)).toBe(false);
    expect(G.isUndefined(null)).toBe(false);
    expect(G.isUndefined(faker.date.past())).toBe(false);
    expect(G.isUndefined({})).toBe(false);
  });

  it("isNil()", () => {
    expect(G.isNil(undefined)).toBe(true);
    expect(G.isNil(null)).toBe(true);
    expect(G.isNil("")).toBe(true);

    expect(G.isNil(false)).toBe(false);
    expect(G.isNil(1)).toBe(false);
    expect(G.isNil(faker.date.past())).toBe(false);
    expect(G.isNil({})).toBe(false);
  });

  it("isNotNil()", () => {
    expect(G.isNotNil(false)).toBe(true);
    expect(G.isNotNil(1)).toBe(true);
    expect(G.isNotNil(faker.date.past())).toBe(true);
    expect(G.isNotNil({})).toBe(true);

    expect(G.isNotNil(undefined)).toBe(false);
    expect(G.isNotNil(null)).toBe(false);
    expect(G.isNotNil("")).toBe(false);
  });

  it("isFalsy()", () => {
    expect(G.isFalsy(null)).toBe(true);
    expect(G.isFalsy(false)).toBe(true);
    expect(G.isFalsy("")).toBe(true);
    expect(G.isFalsy(undefined)).toBe(true);
    expect(G.isFalsy(0)).toBe(true);
    expect(G.isFalsy(NaN)).toBe(true);

    expect(G.isFalsy(faker.number.int())).toBe(false);
    expect(G.isFalsy(faker.date.past())).toBe(false);
    expect(G.isFalsy({})).toBe(false);
  });

  it("isTruthy()", () => {
    expect(G.isTruthy(faker.number.int())).toBe(true);
    expect(G.isTruthy(faker.date.past())).toBe(true);
    expect(G.isTruthy({})).toBe(true);

    expect(G.isTruthy(null)).toBe(false);
    expect(G.isTruthy(false)).toBe(false);
    expect(G.isTruthy("")).toBe(false);
    expect(G.isTruthy(undefined)).toBe(false);
  });

  it("isString()", () => {
    expect(G.isString(faker.lorem.words(2))).toBe(true);

    expect(G.isString(null)).toBe(false);
    expect(G.isString(false)).toBe(false);
    expect(G.isString(faker.number.int())).toBe(false);
    expect(G.isString(undefined)).toBe(false);
    expect(G.isString(faker.date.past())).toBe(false);
    expect(G.isString({})).toBe(false);
  });

  it("isNumber()", () => {
    expect(G.isNumber(faker.number.int())).toBe(true);
    expect(G.isNumber(faker.number.float())).toBe(true);

    expect(G.isNumber(faker.lorem.words(2))).toBe(false);
    expect(G.isNumber(null)).toBe(false);
    expect(G.isNumber(false)).toBe(false);
    expect(G.isNumber(undefined)).toBe(false);
    expect(G.isNumber(faker.date.past())).toBe(false);
    expect(G.isNumber({})).toBe(false);
  });

  it("isDate()", () => {
    expect(G.isDate(faker.date.past())).toBe(true);

    expect(G.isDate(1)).toBe(false);
    expect(G.isDate(faker.lorem.words(2))).toBe(false);
    expect(G.isDate(null)).toBe(false);
    expect(G.isDate(false)).toBe(false);
    expect(G.isDate(undefined)).toBe(false);
    expect(G.isDate({})).toBe(false);
  });

  it.only("isArray()", () => {
    expect(G.isArray([])).toBe(true);
    expect(G.isArray([faker.number.int()])).toBe(true);
    expect(G.isArray(new Array())).toBe(true);
    expect(G.isArray(new Array("a", "b", "c", "d"))).toBe(true);
    expect(G.isArray(new Array(3))).toBe(true);
    // Little known fact: Array.prototype itself is an array:
    expect(G.isArray(Array.prototype)).toBe(true);

    expect(G.isArray({})).toBe(false);
    expect(G.isArray(null)).toBe(false);
    expect(G.isArray(undefined)).toBe(false);
    expect(G.isArray(faker.number.int())).toBe(false);
    expect(G.isArray("Array")).toBe(false);
    expect(G.isArray(true)).toBe(false);
    expect(G.isArray(false)).toBe(false);
    expect(G.isArray(faker.date.past())).toBe(false);
    expect(G.isArray(new Uint8Array(32))).toBe(false);
    // This is not an array, because it was not created using the
    // array literal syntax or the Array constructor
    expect(G.isArray({ __proto__: Array.prototype })).toBe(false);
  });
});
