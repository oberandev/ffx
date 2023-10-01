import * as Eq from "fp-ts/lib/Eq.js";
import { pipe } from "fp-ts/lib/function.js";
import * as J from "fp-ts/lib/Json.js";
import * as O from "fp-ts/lib/Option.js";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as Str from "fp-ts/lib/string.js";

type DbConstraint = RequiredConstraint | UniqueConstraint;

interface RequiredConstraint {
  readonly type: "required";
}

interface UniqueConstraint {
  readonly type: "unique";
  readonly config?: {
    readonly ignore_empty: boolean;
  };
}

interface UniqueConstraintArgs {
  readonly ignoreEmpty?: boolean;
}

const _mkRequiredConstraint = (): DbConstraint => {
  return {
    type: "required",
  };
};

const _mkUniqueConstraint = (args?: UniqueConstraintArgs): DbConstraint => {
  return {
    type: "unique",
    config: pipe(
      O.fromNullable(args),
      O.match(
        () => undefined,
        (args_) => ({
          ignore_empty: pipe(
            O.fromNullable(args_.ignoreEmpty),
            O.getOrElse(() => false),
          ),
        }),
      ),
    ),
  };
};

const eqDbConstraint: Eq.Eq<DbConstraint> = pipe(
  Str.Eq,
  Eq.contramap((dbContstraint) => dbContstraint.type),
);

export interface NumberField {
  readonly constraints?: ReadonlyArray<DbConstraint>;
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly metadata?: J.Json;
  readonly readonly?: boolean;
  readonly type: "number";
}

interface Builder {
  readonly withDescription: (description: string) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withReadonly: () => Builder;
  readonly withRequired: () => Builder;
  readonly withUnique: (args?: UniqueConstraintArgs) => Builder;
  readonly done: () => NumberField;
}

/**
 * Builder class for a `NumberField`.
 *
 * @example
 *
 * ```ts
 * import { NumberFieldBuilder } from "@oberan/ffx-orm";
 *
 * const numberField = new NumberFieldBuilder("foo_bar", "Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class NumberFieldBuilder implements Builder {
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
   * import { NumberFieldBuilder } from "@oberan/ffx-orm";
   *
   * const salary = new NumberFieldBuilder("salary", "Salary")
   *   .withDescription("Annual Salary")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): NumberFieldBuilder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * ASDF
   *
   * @example
   *
   * ```ts
   * import { NumberFieldBuilder } from "@oberan/ffx-orm";
   *
   * const salary = new NumberFieldBuilder("salary", "Salary")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): NumberFieldBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Ensures a user cannot edit the value.
   *
   * @example
   *
   * ```ts
   * import { NumberFieldBuilder } from "@oberan/ffx-orm";
   *
   * const salary = new NumberFieldBuilder("salary", "Salary")
   *   .withReadonly()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withReadonly(): NumberFieldBuilder {
    this.#isReadOnly = true;

    return this;
  }

  /**
   * Ensures a field must have a value otherwise an error message will be present.
   *
   * @example
   *
   * ```ts
   * import { NumberFieldBuilder } from "@oberan/ffx-orm";
   *
   * const salary = new NumberFieldBuilder("salary", "Salary")
   *   .withRequired()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withRequired(): NumberFieldBuilder {
    this.#constraints = pipe(
      this.#constraints,
      RA.append(_mkRequiredConstraint()),
      RA.uniq(eqDbConstraint),
    );

    return this;
  }

  /**
   * Ensures a field is unique.
   *
   * @example
   *
   * ```ts
   * import { NumberFieldBuilder } from "@oberan/ffx-orm";
   *
   * const salary = new NumberFieldBuilder("salary", "Salary")
   *   .withUnique()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withUnique(args?: UniqueConstraintArgs): NumberFieldBuilder {
    this.#constraints = pipe(
      this.#constraints,
      RA.append(_mkUniqueConstraint(args)),
      RA.uniq(eqDbConstraint),
    );

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): NumberField {
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
      type: "number",
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
