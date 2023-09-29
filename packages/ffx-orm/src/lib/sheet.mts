import * as E from "fp-ts/Either";
import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as Str from "fp-ts/string";

import { BooleanField } from "./boolean_field.mjs";
import { CustomAction } from "./custom_action.mjs";
import { EnumField } from "./enum_field.mjs";
import { NumberField } from "./number_field.mjs";
import { ReferenceField } from "./reference_field.mjs";
import { TextField } from "./text_field.mjs";

type Permission = "*" | "add" | "delete" | "edit" | "import";

const eqPermission: Eq.Eq<Permission> = Str.Eq;

type Field = BooleanField | EnumField | NumberField | ReferenceField | TextField;

const eqField: Eq.Eq<Field> = pipe(
  Str.Eq,
  Eq.contramap((field) => field.type),
);

export interface Sheet {
  readonly access?: RNEA.ReadonlyNonEmptyArray<Permission>;
  readonly actions?: ReadonlyArray<CustomAction>;
  readonly allowAdditionalFields?: boolean;
  readonly description?: string;
  readonly fields: ReadonlyArray<Field>;
  readonly metadata?: J.Json;
  readonly name: string;
  readonly readonly?: boolean;
  readonly slug?: string;
}

interface Builder {
  withAdditionalFieldsAllowed: () => Builder;
  withCustomAction: (action: CustomAction) => Builder;
  withDescription: (description: string) => Builder;
  withField: (field: Field) => Builder;
  withMetadata: (json: J.Json) => Builder;
  withPermissions: (permissions: ReadonlyArray<Permission>) => Builder;
  withReadonly: () => Builder;
  done: () => Sheet;
}

/**
 * Builder class for a `Sheet`.
 *
 * @since 0.1.0
 */
export class SheetBuilder implements Builder {
  #allowAdditionalFields: boolean = false;
  #customActions: ReadonlyArray<CustomAction> = [];
  #description: O.Option<string> = O.none;
  readonly #displayName: string;
  #fields: ReadonlyArray<Field> = [];
  #isReadOnly: boolean = false;
  #metadata: O.Option<J.Json> = O.none;
  #permissions: ReadonlyArray<Permission> = [];
  readonly #slug: string;

  constructor(slug: string, displayName: string) {
    this.#displayName = displayName;
    this.#slug = slug;
  }

  /**
   * ASDF.
   *
   * @example
   *
   * ```ts
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withAdditionalFieldsAllowed()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withAdditionalFieldsAllowed(): SheetBuilder {
    this.#allowAdditionalFields = true;

    return this;
  }

  /**
   *
   * @since 0.1.0
   */
  withCustomAction(customAction: CustomAction): SheetBuilder {
    this.#customActions = pipe(this.#customActions, RA.append(customAction));

    return this;
  }

  /**
   * ASDF.
   *
   * @example
   *
   * ```ts
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withDescription("New leads from winter campaign")
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withDescription(description: string): SheetBuilder {
    this.#description = O.some(description);

    return this;
  }

  /**
   * ASDF.
   *
   * @example
   *
   * ```ts
   * const email = new TextFieldBuilder("email", "Email")
   *   .withDescription("Company email address")
   *   .done();
   *
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withField(email)
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withField(field: Field): SheetBuilder {
    this.#fields = pipe(this.#fields, RA.append(field));

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withMetadata({ foo: "bar" })
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withMetadata(json: J.Json): SheetBuilder {
    this.#metadata = O.some(json);

    return this;
  }

  /**
   * Asdf. Defaults to "*" which is everything/all.
   *
   * @example
   *
   * ```ts
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withPermissions(["edit", "import"])
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withPermissions(permissions: ReadonlyArray<Permission>): SheetBuilder {
    this.#permissions = pipe(permissions, RA.uniq(eqPermission));

    return this;
  }

  /**
   * Ensures a user cannot edit the sheet.
   *
   * @example
   *
   * ```ts
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withReadonly()
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withReadonly(): SheetBuilder {
    this.#isReadOnly = true;

    return this;
  }

  /**
   * Calls the internal builder to produce JSON required by Flatfile.
   *
   * @since 0.1.0
   */
  done(): Sheet {
    return {
      access: pipe(
        this.#permissions,
        RNEA.fromReadonlyArray,
        O.getOrElse(() => RNEA.of("*" as Permission)),
      ),
      actions: this.#customActions,
      allowAdditionalFields: this.#allowAdditionalFields,
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      fields: pipe(this.#fields),
      metadata: pipe(
        this.#metadata,
        O.getOrElseW(() => undefined),
      ),
      name: this.#displayName,
      readonly: this.#isReadOnly,
      slug: this.#slug,
    };
  }
}

export const validate = (sheet: Sheet): E.Either<string, Sheet> => {
  // error when fields is a NonEmptyArray

  return E.right(sheet);
};
