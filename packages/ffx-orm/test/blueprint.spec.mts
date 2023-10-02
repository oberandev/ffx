import { BlueprintBuilder } from "../src/lib/blueprint.mjs";
import { SheetBuilder } from "../src/lib/sheet.mjs";

describe("Blueprint", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar").done();

      expect(blueprint.name).toEqual("Foo Bar");
      expect(blueprint.primary).toBe(false);
      expect(blueprint.sheets).toStrictEqual([]);
      expect(blueprint.slug).toEqual("foo_bar");
    });

    it("should handle withPrimary()", () => {
      const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar").withPrimary().done();

      expect(blueprint.primary).toBe(true);
    });

    it("should handle withSheet()", () => {
      const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();

      const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar").withSheet(sheet).done();

      expect(blueprint.sheets).toStrictEqual([sheet]);
    });
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
