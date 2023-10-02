import * as J from "fp-ts/lib/Json.js";

import { NumberFieldBuilder } from "../src/lib/number_field.mjs";

describe("NumberField", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar").done();

      expect(numberField.constraints).toEqual(undefined);
      expect(numberField.description).toEqual(undefined);
      expect(numberField.key).toEqual("foo_bar");
      expect(numberField.label).toEqual("Foo Bar");
      expect(numberField.metadata).toEqual(undefined);
      expect(numberField.readonly).toBe(false);
      expect(numberField.type).toEqual("number");
    });

    it("should handle withDescription()", () => {
      const description = "Nothing is certain except death and taxes";

      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar")
        .withDescription(description)
        .done();

      expect(numberField.description).toEqual(description);
    });

    it("should handle withMetadata()", () => {
      const metadata: J.Json = { foo: "bar" };

      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar")
        .withMetadata(metadata)
        .done();

      expect(numberField.metadata).toStrictEqual(metadata);
    });

    it("should handle withReadonly()", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

      expect(numberField.readonly).toBe(true);
    });

    it("should handle withRequired()", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

      expect(numberField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle duplicate withRequired()", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar")
        .withRequired()
        .withRequired()
        .done();

      expect(numberField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle withUnique() without args", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar").withUnique().done();

      expect(numberField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
    });

    it("should handle withUnique() with args", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ ignoreEmpty: true })
        .done();

      expect(numberField.constraints).toStrictEqual([
        {
          type: "unique",
          config: {
            ignore_empty: true,
          },
        },
      ]);
    });

    it("should handle duplicate withUnique() with args", () => {
      const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ ignoreEmpty: true })
        .withUnique({ ignoreEmpty: false })
        .done();

      expect(numberField.constraints).toStrictEqual([
        {
          type: "unique",
          config: {
            ignore_empty: true,
          },
        },
      ]);
    });
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
