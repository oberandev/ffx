import chalk from "chalk";
import * as IO from "fp-ts/IO";

interface Logger {
  fatal: (msg: string) => IO.IO<void>;
  info: (msg: string) => IO.IO<void>;
  warn: (msg: string) => IO.IO<void>;
}

/**
 * Custom logger for plugins useful for debugging.
 *
 * @example
 * import mklogger from "@obearn/ffx-logger";
 *
 * import pkgJson from "./package.json";
 * // note: you'll need `"resolveJsonModule": true` in your `tsconfig.json`
 *
 * const logger = mkLogger(pkgJson.name);
 *
 * logger.info("Hello World!");
 *
 * @since 0.1.0
 */
function mkLogger(pluginName: string): Logger {
  return {
    fatal: (msg: string) => {
      return IO.of(console.error(chalk.red(`[${pluginName}]:[FATAL]`, msg)));
    },
    info: (msg: string) => {
      return IO.of(console.info(chalk.grey(`[${pluginName}]:[INFO]`, msg)));
    },
    warn: (msg: string) => {
      return IO.of(console.warn(chalk.yellow(`[${pluginName}]:[WARN]`, msg)));
    },
  };
}

export default mkLogger;
