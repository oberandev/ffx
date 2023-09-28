import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

export interface ReferenceField {
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly type: "reference";
}

interface Builder {
  withDescription: (description: string) => Builder;
  withReadonly: () => Builder;
  withRequired: () => Builder;
  done: () => ReferenceField;
}

export class ReferenceFieldBuilder implements Builder {
  #description: O.Option<string> = O.none;
  readonly #displayName: string;
  readonly #internaKey: string;

  constructor(internaKey: string, displayName: string) {
    this.#displayName = displayName;
    this.#internaKey = internaKey;
  }

  withDescription(description: string): Builder {
    this.#description = O.some(description);

    return this;
  }

  withReadonly(): Builder {
    return this;
  }

  withRequired(): Builder {
    return this;
  }

  done(): ReferenceField {
    return {
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      key: this.#internaKey,
      label: this.#displayName,
      type: "reference",
    };
  }
}
