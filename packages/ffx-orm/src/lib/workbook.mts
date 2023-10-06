import { pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as Str from "fp-ts/string";

import { CustomAction, eqCustomAction } from "./custom_action.mjs";
import { Sheet, eqSheet } from "./sheet.mjs";

interface Workbook {
  readonly actions?: ReadonlyArray<CustomAction>;
  readonly environmentId?: string;
  readonly labels?: ReadonlyArray<string>;
  readonly metadata?: J.Json;
  readonly name: string;
  readonly sheets?: ReadonlyArray<Sheet>;
  readonly spaceId?: string;
}

interface Builder {
  readonly withCustomAction: (action: CustomAction) => Builder;
  readonly withEnvironmentId: (envId: string) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withLabels: (labels: ReadonlyArray<string>) => Builder;
  readonly withSheet: (sheet: Sheet) => Builder;
  readonly withSpaceId: (spaceId: string) => Builder;
  readonly done: () => Workbook;
}

/**
 * Builder class for a `Workbook`.
 *
 * @example
 *
 * ```ts
 * import { WorkbookBuilder } from "@oberan/ffx-orm";
 *
 * const workbook = new WorkbookBuilder("Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class WorkbookBuilder implements Builder {
  #customActions: ReadonlyArray<CustomAction> = [];
  #environmentId: O.Option<string> = O.none;
  #labels: ReadonlyArray<string> = [];
  #metadata: O.Option<J.Json> = O.none;
  readonly #name: string;
  #sheets: ReadonlyArray<Sheet> = [];
  #spaceId: O.Option<string> = O.none;

  constructor(name: string) {
    this.#name = name;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder, WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").done();
   *
   * const workbook = new WorkbookBuilder("My Workbook")
   *   .withCustomAction(customAction)
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withCustomAction(customAction: CustomAction): WorkbookBuilder {
    this.#customActions = pipe(
      this.#customActions,
      RA.append(customAction),
      RA.uniq(eqCustomAction),
    );

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const workbook = new WorkbookBuilder("My Workbook")
   *   .withEnvironmentId("us_env_qGZbKwDW")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withEnvironmentId(envId: string): WorkbookBuilder {
    this.#environmentId = O.some(envId);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const workbook = new WorkbookBuilder("My Workbook")
   *   .withLabels(["label1", "label2"])
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withLabels(labels: ReadonlyArray<string>): WorkbookBuilder {
    this.#labels = pipe(labels, RA.uniq(Str.Eq));

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const workbook = new WorkbookBuilder("My Workbook")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): WorkbookBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { SheetBuilder, WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();
   *
   * const withSheet = new WorkbookBuilder("My Workbook")
   *   .withSheet(sheet)
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withSheet(sheet: Sheet): WorkbookBuilder {
    this.#sheets = pipe(this.#sheets, RA.append(sheet), RA.uniq(eqSheet));

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { WorkbookBuilder } from "@oberan/ffx-orm";
   *
   * const workbook = new WorkbookBuilder("My Workbook")
   *   .withSpaceId("us_sp_qGZbKwDW")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withSpaceId(spaceId: string): WorkbookBuilder {
    this.#spaceId = O.some(spaceId);

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): Workbook {
    return {
      actions: RA.isEmpty(this.#customActions) ? undefined : this.#customActions,
      environmentId: pipe(
        this.#environmentId,
        O.getOrElseW(() => undefined),
      ),
      labels: RA.isEmpty(this.#labels) ? undefined : this.#labels,
      metadata: pipe(
        this.#metadata,
        O.getOrElseW(() => undefined),
      ),
      name: this.#name,
      sheets: RA.isEmpty(this.#sheets) ? undefined : this.#sheets,
      spaceId: pipe(
        this.#spaceId,
        O.getOrElseW(() => undefined),
      ),
    };
  }
}
