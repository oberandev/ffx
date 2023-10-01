import * as J from "fp-ts/lib/Json.js";

import { EnumFieldBuilder } from "../src/lib/enum_field.mjs";

describe("EnumField", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar").done();

      expect(enumField.constraints).toEqual(undefined);
      expect(enumField.description).toEqual(undefined);
      expect(enumField.key).toEqual("foo_bar");
      expect(enumField.label).toEqual("Foo Bar");
      expect(enumField.metadata).toEqual(undefined);
      expect(enumField.readonly).toBe(false);
      expect(enumField.type).toEqual("enum");
    });
  });

  it("should handle withDescription()", () => {
    const description = "Nothing is certain except death and taxes";

    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar")
      .withDescription(description)
      .done();

    expect(enumField.description).toEqual(description);
  });

  it("should handle withMetadata()", () => {
    const metadata: J.Json = { foo: "bar" };

    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar").withMetadata(metadata).done();

    expect(enumField.metadata).toStrictEqual(metadata);
  });

  it("should handle withReadonly()", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

    expect(enumField.readonly).toBe(true);
  });

  it("should handle withRequired()", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

    expect(enumField.constraints).toStrictEqual([{ type: "required" }]);
  });

  it("should handle duplicate withRequired()", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar")
      .withRequired()
      .withRequired()
      .done();

    expect(enumField.constraints).toStrictEqual([{ type: "required" }]);
  });

  it("should handle withUnique() without args", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar").withUnique().done();

    expect(enumField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
  });

  it("should handle withUnique() with args", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar")
      .withUnique({ caseSensitive: false })
      .done();

    expect(enumField.constraints).toStrictEqual([
      {
        type: "unique",
        config: {
          case_sensitive: false,
          ignore_empty: false,
        },
      },
    ]);
  });

  it("should handle duplicate withUnique() with args", () => {
    const enumField = new EnumFieldBuilder("foo_bar", "Foo Bar")
      .withUnique({ caseSensitive: false })
      .withUnique({ caseSensitive: true })
      .done();

    expect(enumField.constraints).toStrictEqual([
      {
        type: "unique",
        config: {
          case_sensitive: false,
          ignore_empty: false,
        },
      },
    ]);
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
