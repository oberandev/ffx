import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
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
    readonly case_sensitive: boolean;
    readonly ignore_empty: boolean;
  };
}

interface UniqueConstraintArgs {
  readonly caseSensitive?: boolean;
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
          case_sensitive: pipe(
            O.fromNullable(args_.caseSensitive),
            O.getOrElse(() => true),
          ),
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

export interface TextField {
  readonly constraints?: ReadonlyArray<DbConstraint>;
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly metadata?: J.Json;
  readonly readonly?: boolean;
  readonly type: "string";
}

interface Builder {
  readonly withDescription: (description: string) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withReadonly: () => Builder;
  readonly withRequired: () => Builder;
  readonly withUnique: (args?: UniqueConstraintArgs) => Builder;
  readonly done: () => TextField;
}

/**
 * Builder class for a `TextField`.
 *
 * @example
 *
 * ```ts
 * import { TextFieldBuilder } from "@oberan/ffx-orm";
 *
 * const textField = new TextFieldBuilder("foo_bar", "Foo Bar").done();
 * ```
 *
 * @since 0.1.0
 */
export class TextFieldBuilder implements Builder {
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
   * import { TextFieldBuilder } from "@oberan/ffx-orm";
   *
   * const email = new TextFieldBuilder("email", "Email")
   *   .withDescription("Company email address")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): TextFieldBuilder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { TextFieldBuilder } from "@oberan/ffx-orm";
   *
   * const email = new TextFieldBuilder("email", "Email")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): TextFieldBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Ensures a user cannot edit the value.
   *
   * @example
   *
   * ```ts
   * import { TextFieldBuilder } from "@oberan/ffx-orm";
   *
   * const email = new TextFieldBuilder("email", "Email")
   *   .withReadonly()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withReadonly(): TextFieldBuilder {
    this.#isReadOnly = true;

    return this;
  }

  /**
   * Ensures a field must have a value otherwise an error message will be present.
   *
   * @example
   *
   * ```ts
   * import { TextFieldBuilder } from "@oberan/ffx-orm";
   *
   * const email = new TextFieldBuilder("email", "Email")
   *   .withRequired()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withRequired(): TextFieldBuilder {
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
   * import { TextFieldBuilder } from "@oberan/ffx-orm";
   *
   * const email = new TextFieldBuilder("email", "Email")
   *   .withUnique()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withUnique(args?: UniqueConstraintArgs): TextFieldBuilder {
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
  done(): TextField {
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
      type: "string",
    };
  }
}

// export const validate = (field: TextField): E.Either<string, TextField> => {
//   // error when key is an empty string
//   // warn when label, description are empty strings
//   // ensure metadata is valid JSON
//   // warn when a field is required AND readonly

//   // Use fp-ts These instead of Either to handle error accumulation?
//   return E.right(field);
// };
