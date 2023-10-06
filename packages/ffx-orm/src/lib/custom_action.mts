import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as Str from "fp-ts/string";

type CusotmActionMode = "background" | "foreground";

export interface CustomAction {
  readonly confirm?: boolean;
  readonly description?: string;
  readonly label: string;
  readonly mode?: CusotmActionMode;
  readonly operation: string;
  readonly primary?: boolean;
  readonly requireAllValid?: boolean;
  readonly requireSelection?: boolean;
  readonly tooltip?: string;
}

export const eqCustomAction: Eq.Eq<CustomAction> = pipe(
  Str.Eq,
  Eq.contramap((customAction) => customAction.operation),
);

interface Builder {
  readonly withConfirmation: () => Builder;
  readonly withDescription: (description: string) => Builder;
  readonly withMode: (mode: CusotmActionMode) => Builder;
  readonly withNoInvalidRecords: () => Builder;
  readonly withPrimary: () => Builder;
  readonly withRecordSelection: () => Builder;
  readonly withTooltip: (toolip: string) => Builder;
  readonly done: () => CustomAction;
}

/**
 * Builder class for a `CustomAction`.
 *
 * @example
 *
 * ```ts
 * import { CustomActionBuilder } from "@oberan/ffx-orm";
 *
 * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class CustomActionBuilder implements Builder {
  #description: O.Option<string> = O.none;
  readonly #displayName: string;
  readonly #internalKey: string;
  #isConfirmationRequired: boolean = false;
  #isPrimary: boolean = false;
  #isRecordSelectionRequired: boolean = false;
  #mode: CusotmActionMode = "background";
  #noInvalidRecords: boolean = false;
  #tooltip: O.Option<string> = O.none;

  constructor(interalKey: string, displayName: string) {
    this.#displayName = displayName;
    this.#internalKey = interalKey;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withConfirmation()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withConfirmation(): Builder {
    this.#isConfirmationRequired = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withDescription("some description")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): Builder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withConfirmation()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMode(mode: CusotmActionMode): Builder {
    this.#mode = mode;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withNoInvalidRecords()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withNoInvalidRecords(): Builder {
    this.#noInvalidRecords = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withPrimary()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withPrimary(): Builder {
    this.#isPrimary = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withRecordSelection()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withRecordSelection(): Builder {
    this.#isRecordSelectionRequired = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar")
   *   .withTooltip("some helpful tooltip message")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withTooltip(toolip: string): Builder {
    this.#tooltip = O.some(toolip);

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): CustomAction {
    return {
      confirm: this.#isConfirmationRequired,
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      label: this.#displayName,
      mode: this.#mode,
      operation: this.#internalKey,
      primary: this.#isPrimary,
      requireAllValid: this.#noInvalidRecords,
      requireSelection: this.#isRecordSelectionRequired,
      tooltip: pipe(
        this.#tooltip,
        O.getOrElseW(() => undefined),
      ),
    };
  }
}
