import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports
import mkLogger from "../src/lib/logger.mjs";

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
