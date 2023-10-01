import { pipe } from "fp-ts/lib/function.js";
import * as J from "fp-ts/lib/Json.js";
import * as O from "fp-ts/lib/Option.js";
import * as RA from "fp-ts/lib/ReadonlyArray.js";

import { CustomActionBuilder, eqCustomAction } from "../src/lib/custom_action.mjs";
import { eqField, Permission, SheetBuilder } from "../src/lib/sheet.mjs";
import { TextFieldBuilder } from "../src/lib/text_field.mjs";

describe("Sheet", () => {
  it("should handle calling builder with defaults", () => {
    const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();

    expect(sheet.access).toEqual(["*"]);
    expect(sheet.actions).toEqual(undefined);
    expect(sheet.allowAdditionalFields).toBe(false);
    expect(sheet.description).toEqual(undefined);
    expect(sheet.fields).toStrictEqual([]);
    expect(sheet.metadata).toEqual(undefined);
    expect(sheet.name).toEqual("Foo Bar");
    expect(sheet.readonly).toBe(false);
    expect(sheet.slug).toEqual("foo_bar");
  });

  it("should handle withAdditionalFieldsAllowed()", () => {
    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withAdditionalFieldsAllowed().done();

    expect(sheet.allowAdditionalFields).toBe(true);
  });

  it("should handle withCustomAction()", () => {
    const customAction = new CustomActionBuilder("my_custom_action", "My custom action").done();

    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withCustomAction(customAction).done();

    expect(sheet.actions).toHaveLength(1);
    pipe(
      O.fromNullable(sheet.actions),
      O.chain(RA.head),
      O.match(
        () => assert.fail("length === 0"),
        (action) => expect(eqCustomAction.equals(customAction, action)).toBe(true),
      ),
    );
  });

  it("should handle withDescription()", () => {
    const description = "Nothing is certain except death and taxes";

    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withDescription(description).done();

    expect(sheet.description).toEqual(description);
  });

  it("should handle withField()", () => {
    const email = new TextFieldBuilder("email", "Email")
      .withDescription("Company email address")
      .done();
    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withField(email).done();

    expect(sheet.fields).toHaveLength(1);
    pipe(
      O.fromNullable(sheet.fields),
      O.chain(RA.head),
      O.match(
        () => assert.fail("length === 0"),
        (field) => expect(eqField.equals(email, field)).toBe(true),
      ),
    );
  });

  it("should handle withMetadata()", () => {
    const metadata: J.Json = { foo: "bar" };

    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withMetadata(metadata).done();

    expect(sheet.metadata).toStrictEqual(metadata);
  });

  it("should handle withPermissions()", () => {
    const permissions: ReadonlyArray<Permission> = ["edit", "import"];

    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withPermissions(permissions).done();

    expect(sheet.access).toHaveLength(2);
  });

  it("should handle withPermissions() with extra '*'", () => {
    const permissions: ReadonlyArray<Permission> = ["edit", "import", "*"];

    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withPermissions(permissions).done();

    expect(sheet.access).toHaveLength(2);
  });

  it("should handle withReadonly()", () => {
    const sheet = new SheetBuilder("foo_bar", "Foo Bar").withReadonly().done();

    expect(sheet.readonly).toBe(true);
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
