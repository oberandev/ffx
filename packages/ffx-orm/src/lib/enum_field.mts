import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

export interface EnumField {
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly type: "enum";
}

interface Builder {
  withDescription: (description: string) => Builder;
  withReadonly: () => Builder;
  withRequired: () => Builder;
  done: () => EnumField;
}

export class EnumFieldBuilder implements Builder {
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

  done(): EnumField {
    return {
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      key: this.#internaKey,
      label: this.#displayName,
      type: "enum",
    };
  }
}
