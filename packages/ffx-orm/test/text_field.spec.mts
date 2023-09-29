import * as J from "fp-ts/Json";

import { TextFieldBuilder } from "../src/lib/text_field.mjs";

describe("TextField", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar").done();

      expect(textField.key).toEqual("foo_bar");
      expect(textField.label).toEqual("Foo Bar");
      expect(textField.type).toEqual("string");
      expect(textField.constraints).toEqual(undefined);
      expect(textField.readonly).toBe(false);
      expect(textField.metadata).toEqual(undefined);
    });

    it("should handle withDescription()", () => {
      const description = "Nothing is certain except death and taxes";

      const textField = new TextFieldBuilder("foo_bar", "Foo Bar")
        .withDescription(description)
        .done();

      expect(textField.description).toEqual(description);
    });

    it("should handle withMetadata()", () => {
      const metadata: J.Json = { foo: "bar" };

      const textField = new TextFieldBuilder("foo_bar", "Foo Bar").withMetadata(metadata).done();

      expect(textField.metadata).toEqual(metadata);
    });

    it("should handle withReadonly()", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

      expect(textField.readonly).toBe(true);
    });

    it("should handle withRequired()", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

      expect(textField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle duplicate withRequired()", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar")
        .withRequired()
        .withRequired()
        .done();

      expect(textField.constraints).toStrictEqual([{ type: "required" }]);
    });

    it("should handle withUnique() without args", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar").withUnique().done();

      expect(textField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
    });

    it("should handle withUnique() with args", () => {
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ caseSensitive: false })
        .done();

      expect(textField.constraints).toStrictEqual([
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
      const textField = new TextFieldBuilder("foo_bar", "Foo Bar")
        .withUnique({ caseSensitive: false })
        .withUnique({ caseSensitive: true })
        .done();

      expect(textField.constraints).toStrictEqual([
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
