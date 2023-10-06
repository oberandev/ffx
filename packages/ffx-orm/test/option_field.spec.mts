import * as J from "fp-ts/Json";

import { Choices, OptionFieldBuilder } from "../src/lib/option_field.mjs";

describe("OptionField", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").done();

      expect(optionField.constraints).toEqual(undefined);
      expect(optionField.description).toEqual(undefined);
      expect(optionField.key).toEqual("foo_bar");
      expect(optionField.label).toEqual("Foo Bar");
      expect(optionField.metadata).toEqual(undefined);
      expect(optionField.readonly).toBe(false);
      expect(optionField.type).toEqual("enum");
    });
  });

  it("should handle withChoices()", () => {
    const choices: Choices = [{ internalKey: "foo_bar", displayValue: "Foo Bar" }];

    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").withChoices(choices).done();

    expect(optionField.config.options).toStrictEqual([{ label: "Foo Bar", value: "foo_bar" }]);
  });

  it("should handle withDescription()", () => {
    const description = "Nothing is certain except death and taxes";

    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar")
      .withDescription(description)
      .done();

    expect(optionField.description).toEqual(description);
  });

  it("should handle withMetadata()", () => {
    const metadata: J.Json = { foo: "bar" };

    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").withMetadata(metadata).done();

    expect(optionField.metadata).toStrictEqual(metadata);
  });

  it("should handle withReadonly()", () => {
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").withReadonly().done();

    expect(optionField.readonly).toBe(true);
  });

  it("should handle withRequired()", () => {
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").withRequired().done();

    expect(optionField.constraints).toStrictEqual([{ type: "required" }]);
  });

  it("should handle duplicate withRequired()", () => {
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar")
      .withRequired()
      .withRequired()
      .done();

    expect(optionField.constraints).toStrictEqual([{ type: "required" }]);
  });

  it("should handle withUnique() without args", () => {
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar").withUnique().done();

    expect(optionField.constraints).toStrictEqual([{ type: "unique", config: undefined }]);
  });

  it("should handle withUnique() with args", () => {
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar")
      .withUnique({ caseSensitive: false })
      .done();

    expect(optionField.constraints).toStrictEqual([
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
    const optionField = new OptionFieldBuilder("foo_bar", "Foo Bar")
      .withUnique({ caseSensitive: false })
      .withUnique({ caseSensitive: true })
      .done();

    expect(optionField.constraints).toStrictEqual([
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
