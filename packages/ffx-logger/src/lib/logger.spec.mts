import mkLogger from "./logger.mjs";

// eslint-disable-next-line import/no-relative-parent-imports
import pkgJson from "../../package.json";

describe("logger", () => {
  const logger = mkLogger(pkgJson.name);

  it("should handle fatal messages", () => {
    const spy = vi.spyOn(logger, "fatal");

    logger.fatal("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle info messages", () => {
    const spy = vi.spyOn(logger, "info");

    logger.info("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle warn messages", () => {
    const spy = vi.spyOn(logger, "warn");

    logger.warn("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
