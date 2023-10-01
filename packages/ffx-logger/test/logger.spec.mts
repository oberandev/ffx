import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports
import mkLogger from "../src/lib/logger.mjs";

describe("logger", () => {
  const logger = mkLogger(pkgJson.name);

  it("should handle a debug message", () => {
    const spy = vi.spyOn(logger, "debug");

    logger.debug("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle a fatal message", () => {
    const spy = vi.spyOn(logger, "fatal");

    logger.fatal("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle a info message", () => {
    const spy = vi.spyOn(logger, "info");

    logger.info("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle a trace message", () => {
    const spy = vi.spyOn(logger, "trace");

    logger.trace("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should handle a warn message", () => {
    const spy = vi.spyOn(logger, "warn");

    logger.warn("foo");

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
