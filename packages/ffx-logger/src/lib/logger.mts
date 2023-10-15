import chalk from "chalk";
import * as IO from "fp-ts/IO";

interface Logger {
  readonly debug: (msg: string) => IO.IO<void>;
  readonly fatal: (msg: string) => IO.IO<void>;
  readonly info: (msg: string) => IO.IO<void>;
  readonly trace: (msg: string) => IO.IO<void>;
  readonly warn: (msg: string) => IO.IO<void>;
}

/**
 * Custom logger for plugins useful for debugging.
 *
 * @example
 *
 * ```ts
 * import mkLogger from "@obearn/ffx-logger";
 *
 * import pkgJson from "./package.json";
 * // note: you'll need `"resolveJsonModule": true` in your `tsconfig.json`
 *
 * const logger = mkLogger(pkgJson.name);
 *
 * logger.info("Hello World!");
 * ```
 *
 * @since 0.1.0
 */
export function mkLogger(pluginName: string): Logger {
  return {
    debug: (msg: string) => {
      return IO.of(
        console.debug(
          `${chalk.inverse(` ${pluginName} | ${new Date().toISOString()} `)} ${chalk.blue(
            "[DEBUG]",
          )}`,
          msg,
        ),
      );
    },
    fatal: (msg: string) => {
      return IO.of(
        console.error(
          `${chalk.inverse(` ${pluginName} | ${new Date().toISOString()} `)} ${chalk.red(
            "[FATAL]",
          )}`,
          msg,
        ),
      );
    },
    info: (msg: string) => {
      return IO.of(
        console.info(
          `${chalk.inverse(` ${pluginName} | ${new Date().toISOString()} `)} ${chalk.green(
            "[INFO]",
          )}`,
          msg,
        ),
      );
    },
    trace: (msg: string) => {
      return IO.of(
        console.info(
          `${chalk.inverse(` ${pluginName} | ${new Date().toISOString()} `)} ${chalk.magenta(
            "[TRACE]",
          )}`,
          msg,
        ),
      );
    },
    warn: (msg: string) => {
      return IO.of(
        console.warn(
          `${chalk.inverse(` ${pluginName} | ${new Date().toISOString()} `)} ${chalk.yellow(
            "[WARN]",
          )}`,
          msg,
        ),
      );
    },
  };
}
