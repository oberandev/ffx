import { faker } from "@faker-js/faker";
import * as fc from "fast-check";

import * as G from "../src/lib/guards.mjs";

describe("ffx-guards", () => {
  it("isNull()", () => {
    expect(G.isNull(null)).toBe(true);

    expect(G.isNull(undefined)).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isNull(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isNull(date)));
    fc.assert(fc.property(fc.float(), (float) => !G.isNull(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isNull(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isNull(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isNull(str)));
  });

  it("isUndefined()", () => {
    expect(G.isUndefined(undefined)).toBe(true);

    expect(G.isUndefined(null)).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isUndefined(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isUndefined(date)));
    fc.assert(fc.property(fc.float(), (float) => !G.isUndefined(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isUndefined(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isUndefined(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isUndefined(str)));
  });

  it("isNil()", () => {
    expect(G.isNil(undefined)).toBe(true);
    expect(G.isNil(null)).toBe(true);

    fc.assert(fc.property(fc.boolean(), (bool) => !G.isNil(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isNil(date)));
    fc.assert(fc.property(fc.float(), (float) => !G.isNil(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isNil(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isNil(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isNil(str)));
  });

  it("isNotNil()", () => {
    fc.assert(fc.property(fc.boolean(), (bool) => G.isNotNil(bool)));
    fc.assert(fc.property(fc.date(), (date) => G.isNotNil(date)));
    fc.assert(fc.property(fc.float(), (float) => G.isNotNil(float)));
    fc.assert(fc.property(fc.integer(), (int) => G.isNotNil(int)));
    fc.assert(fc.property(fc.object(), (obj) => G.isNotNil(obj)));
    fc.assert(fc.property(fc.string(), (str) => G.isNotNil(str)));

    expect(G.isNotNil(null)).toBe(false);
    expect(G.isNotNil(undefined)).toBe(false);
  });

  it("isFalsy()", () => {
    expect(G.isFalsy(null)).toBe(true);
    expect(G.isFalsy(undefined)).toBe(true);
    expect(G.isFalsy(false)).toBe(true);
    expect(G.isFalsy(0)).toBe(true);
    expect(G.isFalsy(NaN)).toBe(true);

    expect(G.isFalsy(true)).toBe(false);
    expect(G.isFalsy(1)).toBe(false);
    fc.assert(fc.property(fc.date(), (date) => !G.isFalsy(date)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isFalsy(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isFalsy(str)));
  });

  it("isTruthy()", () => {
    expect(G.isTruthy(true)).toBe(true);
    expect(G.isTruthy(1)).toBe(true);
    fc.assert(fc.property(fc.date(), (date) => G.isTruthy(date)));
    fc.assert(fc.property(fc.object(), (obj) => G.isTruthy(obj)));
    fc.assert(fc.property(fc.string(), (str) => G.isTruthy(str)));

    expect(G.isTruthy(0)).toBe(false);
    expect(G.isTruthy(null)).toBe(false);
    expect(G.isTruthy(false)).toBe(false);
    expect(G.isTruthy(undefined)).toBe(false);
    expect(G.isTruthy(NaN)).toBe(false);
  });

  it("isString()", () => {
    fc.assert(fc.property(fc.string(), (str) => G.isString(str)));

    expect(G.isString(null)).toBe(false);
    expect(G.isString(undefined)).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isString(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isString(date)));
    fc.assert(fc.property(fc.float(), (float) => !G.isString(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isString(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isString(obj)));
  });

  it("isNumber()", () => {
    fc.assert(fc.property(fc.float(), (float) => G.isNumber(float)));
    fc.assert(fc.property(fc.integer(), (int) => G.isNumber(int)));

    expect(G.isNumber(null)).toBe(false);
    expect(G.isNumber(undefined)).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isNumber(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isNumber(date)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isNumber(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isNumber(str)));
  });

  it("isDate()", () => {
    fc.assert(fc.property(fc.date(), (date) => G.isDate(date)));

    expect(G.isDate(null)).toBe(false);
    expect(G.isDate(undefined)).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isDate(bool)));
    fc.assert(fc.property(fc.float(), (float) => !G.isDate(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isDate(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isDate(obj)));
    fc.assert(fc.property(fc.string(), (str) => !G.isDate(str)));
  });

  it("isArray()", () => {
    expect(G.isArray([])).toBe(true);
    expect(G.isArray([faker.number.int()])).toBe(true);
    expect(G.isArray(new Array())).toBe(true);
    expect(G.isArray(new Array("a", "b", "c", "d"))).toBe(true);
    expect(G.isArray(new Array(3))).toBe(true);
    // Little known fact: Array.prototype itself is an array:
    expect(G.isArray(Array.prototype)).toBe(true);

    expect(G.isArray(null)).toBe(false);
    expect(G.isArray(undefined)).toBe(false);
    expect(G.isArray("Array")).toBe(false);
    expect(G.isArray(new Uint8Array(32))).toBe(false);
    // This is not an array, because it was not created using the
    // array literal syntax or the Array constructor
    expect(G.isArray({ __proto__: Array.prototype })).toBe(false);
    fc.assert(fc.property(fc.boolean(), (bool) => !G.isArray(bool)));
    fc.assert(fc.property(fc.date(), (date) => !G.isArray(date)));
    fc.assert(fc.property(fc.float(), (float) => !G.isArray(float)));
    fc.assert(fc.property(fc.integer(), (int) => !G.isArray(int)));
    fc.assert(fc.property(fc.object(), (obj) => !G.isArray(obj)));
  });
});
