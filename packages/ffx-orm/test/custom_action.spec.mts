import { CustomActionBuilder } from "../src/lib/custom_action.mjs";

describe("CustomAction", () => {
  describe("[Builders]", () => {
    it("should handle calling builder with defaults", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").done();

      expect(customAction.confirm).toBe(false);
      expect(customAction.description).toEqual(undefined);
      expect(customAction.label).toEqual("Foo Bar");
      expect(customAction.mode).toEqual("background");
      expect(customAction.operation).toEqual("foo_bar");
      expect(customAction.primary).toBe(false);
      expect(customAction.requireAllValid).toBe(false);
      expect(customAction.requireSelection).toBe(false);
      expect(customAction.tooltip).toEqual(undefined);
    });

    it("should handle withConfirmation()", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").withConfirmation().done();

      expect(customAction.confirm).toBe(true);
    });

    it("should handle withDescription()", () => {
      const description = "Nothing is certain except death and taxes";

      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
        .withDescription(description)
        .done();

      expect(customAction.description).toEqual(description);
    });

    it("should handle withMode()", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
        .withMode("foreground")
        .done();

      expect(customAction.mode).toEqual("foreground");
    });

    it("should handle withNoInvalidRecords()", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
        .withNoInvalidRecords()
        .done();

      expect(customAction.requireAllValid).toBe(true);
    });

    it("should handle withPrimary()", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").withPrimary().done();

      expect(customAction.primary).toBe(true);
    });

    it("should handle withRecordSelection()", () => {
      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
        .withRecordSelection()
        .done();

      expect(customAction.requireSelection).toBe(true);
    });

    it("should handle withTooltip()", () => {
      const toolip = "Nothing is certain except death and taxes";

      const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").withTooltip(toolip).done();

      expect(customAction.tooltip).toEqual(toolip);
    });
  });

  describe("[Validations]", () => {
    it("should handle validate() with invalid metadata JSON", () => {});
  });
});
