import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as Eq from "fp-ts/Eq";
import * as J from "fp-ts/Json";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as Str from "fp-ts/string";

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
  withDescription: (description: string) => Builder;
  withMetadata: (json: J.Json) => Builder;
  withReadonly: () => Builder;
  withRequired: () => Builder;
  withUnique: (args?: UniqueConstraintArgs) => Builder;
  done: () => NumberField;
}

/**
 * ASDF.
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
      type: "number",
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      key: this.#internaKey,
      label: this.#displayName,
      readonly: this.#isReadOnly,
      metadata: pipe(
        this.#metadata,
        O.getOrElseW(() => undefined),
      ),
      constraints: RA.isEmpty(this.#constraints) ? undefined : this.#constraints, // API doesn't like an empty array
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
