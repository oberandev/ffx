import * as J from "fp-ts/lib/Json.js";

import { ReferenceFieldBuilder } from "../src/lib/reference_field.mjs";

describe("ReferenceField", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar").done();

      expect(referenceField.constraints).toEqual(undefined);
      expect(referenceField.description).toEqual(undefined);
      expect(referenceField.key).toEqual("foo_bar");
      expect(referenceField.label).toEqual("Foo Bar");
      expect(referenceField.metadata).toEqual(undefined);
      expect(referenceField.readonly).toBe(false);
      expect(referenceField.type).toEqual("reference");
    });

    it("should handle withDescription()", () => {
      const description = "Nothing is certain except death and taxes";

      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar")
        .withDescription(description)
        .done();

      expect(referenceField.description).toEqual(description);
    });

    it("should handle withMetadata()", () => {
      const metadata: J.Json = { foo: "bar" };

      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar")
        .withMetadata(metadata)
        .done();

      expect(referenceField.metadata).toStrictEqual(metadata);
    });

    it("should handle withReadonly()", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

      expect(referenceField.readonly).toBe(true);
    });

    it("should handle withRequired()", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

      expect(referenceField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle duplicate withRequired()", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar")
        .withRequired()
        .withRequired()
        .done();

      expect(referenceField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle withUnique() without args", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar").withUnique().done();

      expect(referenceField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
    });

    it("should handle withUnique() with args", () => {
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ caseSensitive: false })
        .done();

      expect(referenceField.constraints).toStrictEqual([
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
      const referenceField = new ReferenceFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ caseSensitive: false })
        .withUnique({ caseSensitive: true })
        .done();

      expect(referenceField.constraints).toStrictEqual([
        {
          type: "unique",
          config: {
            case_sensitive: false,
            ignore_empty: false,
          },
        },
      ]);
    });
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
