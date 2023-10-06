import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as Str from "fp-ts/string";

type DbConstraint = RequiredConstraint;

interface RequiredConstraint {
  readonly type: "required";
}

const _mkRequiredConstraint = (): DbConstraint => {
  return {
    type: "required",
  };
};

const eqDbConstraint: Eq.Eq<DbConstraint> = pipe(
  Str.Eq,
  Eq.contramap((dbContstraint) => dbContstraint.type),
);

export interface BooleanField {
  readonly constraints?: ReadonlyArray<DbConstraint>;
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly metadata?: J.Json;
  readonly readonly?: boolean;
  readonly type: "boolean";
}

interface Builder {
  readonly withDescription: (description: string) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withReadonly: () => Builder;
  readonly withRequired: () => Builder;
  readonly done: () => BooleanField;
}

/**
 * Builder class for a `BooleanField`.
 *
 * @example
 *
 * ```ts
 * import { BooleanFieldBuilder } from "@oberan/ffx-orm";
 *
 * const booleanField = new BooleanFieldBuilder("foo_bar", "Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class BooleanFieldBuilder implements Builder {
  #constraints: ReadonlyArray<DbConstraint> = [];
  #description: O.Option<string> = O.none;
  readonly #displayName: string;
  readonly #internaKey: string;
  #isReadOnly: boolean = false;
  #metadata: O.Option<J.Json> = O.none;

  constructor(internaKey: string, displayName: string) {
    this.#displayName = displayName;
    this.#internaKey = internaKey;
  }

  /**
   * Sets the value in the UI table the user will see when they hover their mouse over the column header.
   *
   * @example
   *
   * ```ts
   * import { BooleanFieldBuilder } from "@oberan/ffx-orm";
   *
   * const subscribed = new BooleanFieldBuilder("subscribed", "Subscribed")
   *   .withDescription("Subscribed to marketing campaign")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): BooleanFieldBuilder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { BooleanFieldBuilder } from "@oberan/ffx-orm";
   *
   * const subscribed = new BooleanFieldBuilder("subscribed", "Subscribed")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): BooleanFieldBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Ensures a user cannot edit the value.
   *
   * @example
   *
   * ```ts
   * import { BooleanFieldBuilder } from "@oberan/ffx-orm";
   *
   * const subscribed = new BooleanFieldBuilder("subscribed", "Subscribed")
   *   .withReadonly()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withReadonly(): BooleanFieldBuilder {
    this.#isReadOnly = true;

    return this;
  }

  /**
   * Ensures a field must have a value otherwise an error message will be present.
   *
   * @example
   *
   * ```ts
   * import { BooleanFieldBuilder } from "@oberan/ffx-orm";
   *
   * const subscribed = new BooleanFieldBuilder("subscribed", "Subscribed")
   *   .withRequired()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withRequired(): BooleanFieldBuilder {
    this.#constraints = pipe(
      this.#constraints,
      RA.append(_mkRequiredConstraint()),
      RA.uniq(eqDbConstraint),
    );

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): BooleanField {
    return {
      constraints: RA.isEmpty(this.#constraints) ? undefined : this.#constraints,
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      key: this.#internaKey,
      label: this.#displayName,
      metadata: pipe(
        this.#metadata,
        O.getOrElseW(() => undefined),
      ),
      readonly: this.#isReadOnly,
      type: "boolean",
    };
  }
}

// export const validate = (): E.Either<string, true> => {
//   // error when key is an empty string
//   // warn when label, description are empty strings
//   // ensure metadata is valid JSON
//   // warn when a field is required AND readonly

//   // Use fp-ts These instead of Either to handle error accumulation?
//   return E.right(true);
// };
