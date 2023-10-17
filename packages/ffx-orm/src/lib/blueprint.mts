import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

import { Sheet, eqSheet } from "./sheet.mjs";

export interface Blueprint {
  readonly name: string;
  readonly primary: boolean;
  readonly sheets: ReadonlyArray<Sheet>;
  readonly slug: string;
}

interface Builder {
  readonly withPrimary: () => Builder;
  readonly withSheet: (sheet: Sheet) => Builder;
  readonly done: () => Blueprint;
}

/**
 * Builder class for a `Blueprint`.
 *
 * @example
 *
 * ```ts
 * import { BlueprintBuilder } from "@oberan/ffx-orm";
 *
 * const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class BlueprintBuilder implements Builder {
  #isPrimary: boolean = false;
  readonly #name: string;
  #sheets: ReadonlyArray<Sheet> = [];
  readonly #slug: string;

  constructor(slug: string, name: string) {
    this.#name = name;
    this.#slug = slug;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { BlueprintBuilder } from "@oberan/ffx-orm";
   *
   * const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar")
   *   .withPrimary()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withPrimary(): BlueprintBuilder {
    this.#isPrimary = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { BlueprintBuilder, SheetBuilder } from "@oberan/ffx-orm";
   *
   * const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();
   *
   * const blueprint = new BlueprintBuilder("foo_bar", "Foo Bar")
   *   .withSheet(sheet)
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withSheet(sheet: Sheet): BlueprintBuilder {
    this.#sheets = pipe(this.#sheets, RA.append(sheet), RA.uniq(eqSheet));

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): Blueprint {
    return {
      name: this.#name,
      primary: this.#isPrimary,
      sheets: this.#sheets,
      slug: this.#slug,
    };
  }
}
