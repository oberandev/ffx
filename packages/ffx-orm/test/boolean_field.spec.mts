import * as J from "fp-ts/Json";

import { BooleanFieldBuilder } from "../src/lib/boolean_field.mjs";

describe("BooleanField", () => {
  it("should handle calling builder with defaults", () => {
    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar").done();

    expect(booleanField.constraints).toEqual(undefined);
    expect(booleanField.description).toEqual(undefined);
    expect(booleanField.key).toEqual("foo_bar");
    expect(booleanField.label).toEqual("Foo Bar");
    expect(booleanField.metadata).toEqual(undefined);
    expect(booleanField.readonly).toBe(false);
    expect(booleanField.type).toEqual("boolean");
  });

  it("should handle withDescription()", () => {
    const description = "Nothing is certain except death and taxes";

    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar")
      .withDescription(description)
      .done();

    expect(booleanField.description).toEqual(description);
  });

  it("should handle withMetadata()", () => {
    const metadata: J.Json = { foo: "bar" };

    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar")
      .withMetadata(metadata)
      .done();

    expect(booleanField.metadata).toStrictEqual(metadata);
  });

  it("should handle withReadonly()", () => {
    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

    expect(booleanField.readonly).toBe(true);
  });

  it("should handle withRequired()", () => {
    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

    expect(booleanField.constraints).toStrictEqual([{ type: "required" }]);
  });

  it("should handle duplicate withRequired()", () => {
    const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar")
      .withRequired()
      .withRequired()
      .done();

    expect(booleanField.constraints).toStrictEqual([{ type: "required" }]);
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
