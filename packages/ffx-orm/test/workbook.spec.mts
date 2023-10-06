import { pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";

import { CustomActionBuilder, eqCustomAction } from "../src/lib/custom_action.mjs";
import { SheetBuilder } from "../src/lib/sheet.mjs";
import { WorkbookBuilder } from "../src/lib/workbook.mjs";

describe("Workbook", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const workbook = new WorkbookBuilder("Foo Bar").done();

      expect(workbook.actions).toBe(undefined);
      expect(workbook.environmentId).toBe(undefined);
      expect(workbook.labels).toBe(undefined);
      expect(workbook.metadata).toBe(undefined);
      expect(workbook.name).toEqual("Foo Bar");
      expect(workbook.sheets).toBe(undefined);
      expect(workbook.spaceId).toBe(undefined);
    });
  });

  it("should handle withCustomAction()", () => {
    const customAction = new CustomActionBuilder("my_custom_action", "My custom action").done();

    const workbook = new WorkbookBuilder("Foo Bar").withCustomAction(customAction).done();

    expect(workbook.actions).toHaveLength(1);
    pipe(
      O.fromNullable(workbook.actions),
      O.chain(RA.head),
      O.match(
        () => assert.fail("length === 0"),
        (action) => expect(eqCustomAction.equals(customAction, action)).toBe(true),
      ),
    );
  });

  it("should handle withEnvironmentId()", () => {
    const envId: string = "us_env_hVXkXs0b";

    const workbook = new WorkbookBuilder("Foo Bar").withEnvironmentId(envId).done();

    expect(workbook.environmentId).toEqual(envId);
  });

  it("should handle withLabels()", () => {
    const labels: ReadonlyArray<string> = ["label1", "label2"];

    const workbook = new WorkbookBuilder("Foo Bar").withLabels(labels).done();

    expect(workbook.labels).toStrictEqual(labels);
  });

  it("should handle withMetadata()", () => {
    const metadata: J.Json = { foo: "bar" };

    const workbook = new WorkbookBuilder("Foo Bar").withMetadata(metadata).done();

    expect(workbook.metadata).toStrictEqual(metadata);
  });

  it("should handle withSheet()", () => {
    const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();

    const workbook = new WorkbookBuilder("Foo Bar").withSheet(sheet).done();

    expect(workbook.sheets).toStrictEqual([sheet]);
  });

  it("should handle withSpaceId()", () => {
    const spaceId: string = "us_sp_hVXkXs0b";
    const workbook = new WorkbookBuilder("Foo Bar").withSpaceId(spaceId).done();

    expect(workbook.spaceId).toEqual(spaceId);
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
