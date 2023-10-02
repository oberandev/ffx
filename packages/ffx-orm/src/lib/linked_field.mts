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

export type Cardinality = "has-one";

export interface SheetReferenceArgs {
  readonly cardinality: Cardinality;
  readonly fieldKey: string;
  readonly sheetSlug: string;
}

export interface LinkedField {
  readonly config: Readonly<{
    key: string;
    ref: string;
    relationship: Cardinality;
  }>;
  readonly constraints?: ReadonlyArray<DbConstraint>;
  readonly description?: string;
  readonly key: string;
  readonly label?: string;
  readonly metadata?: J.Json;
  readonly readonly?: boolean;
  readonly type: "reference";
}

interface Builder {
  readonly withDescription: (description: string) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withReadonly: () => Builder;
  readonly withRequired: () => Builder;
  readonly withUnique: (args?: UniqueConstraintArgs) => Builder;
  readonly done: () => LinkedField;
}

/**
 * Builder class for a `LinkedField`.
 *
 * @example
 *
 * ```ts
 * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
 *
 * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar", {
 *   sheetSlug: "venders",
 *   fieldKey: "vender_ref",
 *   cardinality: "has-one",
 * }).done();
 * ```
 *
 * @since 0.1.0
 */
export class LinkedFieldBuilder implements Builder {
  #constraints: ReadonlyArray<DbConstraint> = [];
  #description: O.Option<string> = O.none;
  readonly #displayName: string;
  readonly #internaKey: string;
  #isReadOnly: boolean = false;
  #metadata: O.Option<J.Json> = O.none;
  readonly #sheetReference: SheetReferenceArgs;

  constructor(internaKey: string, displayName: string, sheetReference: SheetReferenceArgs) {
    this.#displayName = displayName;
    this.#internaKey = internaKey;
    this.#sheetReference = sheetReference;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
   *
   * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar")
   *   .withDescription("some description")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): LinkedFieldBuilder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
   *
   * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): LinkedFieldBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
   *
   * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar")
   *   .withReadonly()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withReadonly(): LinkedFieldBuilder {
    this.#isReadOnly = true;

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
   *
   * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar")
   *   .withRequired()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withRequired(): LinkedFieldBuilder {
    this.#constraints = pipe(
      this.#constraints,
      RA.append(_mkRequiredConstraint()),
      RA.uniq(eqDbConstraint),
    );

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { LinkedFieldBuilder } from "@oberan/ffx-orm";
   *
   * const linkedField = new LinkedFieldBuilder("foo_bar", "Foo Bar")
   *   .withUnique()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withUnique(args?: UniqueConstraintArgs): LinkedFieldBuilder {
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
  done(): LinkedField {
    return {
      config: {
        key: this.#sheetReference.fieldKey,
        relationship: this.#sheetReference.cardinality,
        ref: this.#sheetReference.sheetSlug,
      },
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
      type: "reference",
    };
  }
}
