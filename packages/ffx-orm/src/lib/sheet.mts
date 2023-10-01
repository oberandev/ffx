import * as Eq from "fp-ts/lib/Eq.js";
import { pipe } from "fp-ts/lib/function.js";
import * as J from "fp-ts/lib/Json.js";
import * as O from "fp-ts/lib/Option.js";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray.js";
import * as Str from "fp-ts/lib/string.js";

import { BooleanField } from "./boolean_field.mjs";
import { CustomAction, eqCustomAction } from "./custom_action.mjs";
import { LinkedField } from "./linked_field.mjs";
import { NumberField } from "./number_field.mjs";
import { OptionField } from "./option_field.mjs";
import { TextField } from "./text_field.mjs";

export type Permission = "*" | "add" | "delete" | "edit" | "import";

const eqPermission: Eq.Eq<Permission> = Str.Eq;

type Field = BooleanField | OptionField | NumberField | LinkedField | TextField;

export const eqField: Eq.Eq<Field> = {
  equals: (x, y) => {
    return Str.Eq.equals(`${x.type}::${x.key}`, `${y.type}::${y.key}`);
  },
};

export interface Sheet {
  readonly access?: RNEA.ReadonlyNonEmptyArray<Permission>;
  readonly actions?: ReadonlyArray<CustomAction>;
  readonly allowAdditionalFields?: boolean;
  readonly description?: string;
  readonly fields: ReadonlyArray<Field>;
  readonly metadata?: J.Json;
  readonly name: string;
  readonly readonly?: boolean;
  readonly slug: string;
}

export const eqSheet: Eq.Eq<Sheet> = pipe(
  Str.Eq,
  Eq.contramap((sheet) => sheet.slug),
);

interface Builder {
  readonly withAdditionalFieldsAllowed: () => Builder;
  readonly withCustomAction: (action: CustomAction) => Builder;
  readonly withDescription: (description: string) => Builder;
  readonly withField: (field: Field) => Builder;
  readonly withMetadata: (json: J.Json) => Builder;
  readonly withPermissions: (permissions: ReadonlyArray<Permission>) => Builder;
  readonly withReadonly: () => Builder;
  readonly done: () => Sheet;
}

/**
 * Builder class for a `Sheet`.
 *
 * @example
 *
 * ```ts
 * import { SheetBuilder } from "@oberan/ffx-orm";
 *
 * const sheet = new SheetBuilder("foo_bar", "Foo Bar").done();
 * ```
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
   * import { SheetBuilder } from "@oberan/ffx-orm";
   *
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
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { CustomActionBuilder, SheetBuilder } from "@oberan/ffx-orm";
   *
   * const customAction = new CustomActionBuilder("foo_bar", "Foo Bar").done();
   *
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withCustomAction(customAction)
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withCustomAction(customAction: CustomAction): SheetBuilder {
    this.#customActions = pipe(
      this.#customActions,
      RA.append(customAction),
      RA.uniq(eqCustomAction),
    );

    return this;
  }

  /**
   * ASDF.
   *
   * @example
   *
   * ```ts
   * import { SheetBuilder } from "@oberan/ffx-orm";
   *
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
   * import { SheetBuilder, TextFieldBuilder } from "@oberan/ffx-orm";
   *
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
    this.#fields = pipe(this.#fields, RA.append(field), RA.uniq(eqField));

    return this;
  }

  /**
   * Asdf.
   *
   * @example
   *
   * ```ts
   * import { SheetBuilder } from "@oberan/ffx-orm";
   *
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
   * import { SheetBuilder } from "@oberan/ffx-orm";
   *
   * const sheet = new SheetBuilder("leads", "Leads")
   *   .withPermissions(["edit", "import"])
   *   .done();
   * ```
   *
   * @since 0.1.0
   */
  withPermissions(permissions: ReadonlyArray<Permission>): SheetBuilder {
    if (permissions.length > 1 && permissions.includes("*")) {
      this.#permissions = pipe(
        permissions,
        RA.filter((perm) => perm !== "*"),
        RA.uniq(eqPermission),
      );
    } else {
      this.#permissions = pipe(permissions, RA.uniq(eqPermission));
    }

    return this;
  }

  /**
   * Ensures a user cannot edit the sheet.
   *
   * @example
   *
   * ```ts
   * import { SheetBuilder } from "@oberan/ffx-orm";
   *
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
      actions: RA.isEmpty(this.#customActions) ? undefined : this.#customActions,
      allowAdditionalFields: this.#allowAdditionalFields,
      description: pipe(
        this.#description,
        O.getOrElseW(() => undefined),
      ),
      fields: this.#fields,
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

// export const validate = (sheet: Sheet): E.Either<string, Sheet> => {
//   // error when fields is a NonEmptyArray

//   return E.right(sheet);
// };
