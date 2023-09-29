import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as Str from "fp-ts/string";

type CusotmActionMode = "background" | "foreground";

const eqMode: Eq.Eq<CusotmActionMode> = Str.Eq;

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

interface Builder {
  withConfirmation: () => Builder;
  withDescription: (description: string) => Builder;
  withMode: (mode: CusotmActionMode) => Builder;
  withNoInvalidRecords: () => Builder;
  withPrimary: () => Builder;
  withRecordSelection: () => Builder;
  withTooltip: (toolip: string) => Builder;
  done: () => CustomAction;
}

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

  constructor(displayName: string, interalKey: string) {
    this.#displayName = displayName;
    this.#internalKey = interalKey;
  }

  withConfirmation(): Builder {
    this.#isConfirmationRequired = true;

    return this;
  }

  withDescription(description: string): Builder {
    this.#description = O.some(description);

    return this;
  }

  withMode(mode: CusotmActionMode): Builder {
    this.#mode = mode;

    return this;
  }

  withNoInvalidRecords(): Builder {
    this.#noInvalidRecords = true;

    return this;
  }

  withPrimary(): Builder {
    this.#isPrimary = true;

    return this;
  }

  withRecordSelection(): Builder {
    this.#isRecordSelectionRequired = true;

    return this;
  }

  withTooltip(toolip: string): Builder {
    this.#tooltip = O.some(toolip);

    return this;
  }

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
