import * as J from "fp-ts/lib/Json.js";

import { LinkedFieldBuilder, SheetReferenceArgs } from "../src/lib/linked_field.mjs";

describe("LinkedField", () => {
  describe("[Builders]", () => {
    const sheetReference: SheetReferenceArgs = {
      sheetSlug: "venders",
      fieldKey: "vender_ref",
      cardinality: "has-one",
    };

    it("should handle calling builder with defaults", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference).done();

      expect(linkedField.constraints).toEqual(undefined);
      expect(linkedField.description).toEqual(undefined);
      expect(linkedField.key).toEqual("foo_bar");
      expect(linkedField.label).toEqual("Foo Bar");
      expect(linkedField.metadata).toEqual(undefined);
      expect(linkedField.readonly).toBe(false);
      expect(linkedField.type).toEqual("reference");
    });

    it("should handle withDescription()", () => {
      const description = "Nothing is certain except death and taxes";

      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withDescription(description)
        .done();

      expect(linkedField.description).toEqual(description);
    });

    it("should handle withMetadata()", () => {
      const metadata: J.Json = { foo: "bar" };

      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withMetadata(metadata)
        .done();

      expect(linkedField.metadata).toStrictEqual(metadata);
    });

    it("should handle withReadonly()", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withReadonly()
        .done();

      expect(linkedField.readonly).toBe(true);
    });

    it("should handle withRequired()", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withRequired()
        .done();

      expect(linkedField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle duplicate withRequired()", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withRequired()
        .withRequired()
        .done();

      expect(linkedField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle withUnique() without args", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withUnique()
        .done();

      expect(linkedField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
    });

    it("should handle withUnique() with args", () => {
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withUnique({ caseSensitive: false })
        .done();

      expect(linkedField.constraints).toStrictEqual([
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
      const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", sheetReference)
        .withUnique({ caseSensitive: false })
        .withUnique({ caseSensitive: true })
        .done();

      expect(linkedField.constraints).toStrictEqual([
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
