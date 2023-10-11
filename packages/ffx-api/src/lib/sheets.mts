import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as Str from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

import {
  ApiReader,
  DecoderErrors,
  HttpError,
  Successful,
  decodeWith,
  mkHttpError,
} from "./types.mjs";

// ==================
//   Runtime codecs
// ==================

export const CustomActionC = t.intersection([
  t.type({
    label: t.string,
  }),
  t.partial({
    confirm: t.boolean,
    description: t.string,
    icon: t.string,
    inputForm: t.type({
      fields: t.array(
        t.intersection([
          t.type({
            key: t.string,
            label: t.string,
            type: t.union([
              t.literal("boolean"),
              t.literal("enum"),
              t.literal("number"),
              t.literal("string"),
              t.literal("textarea"),
            ]),
          }),
          t.partial({
            config: t.type({
              options: t.intersection([
                t.type({
                  value: t.union([t.boolean, t.number, t.string]),
                }),
                t.partial({
                  color: t.string,
                  description: t.string,
                  icon: t.string,
                  label: t.string,
                  meta: t.UnknownRecord,
                }),
              ]),
            }),
            constraints: t.array(
              t.type({
                type: t.literal("required"),
              }),
            ),
            description: t.string,
          }),
        ]),
      ),
      type: t.literal("simple"),
    }),
    mode: t.union([t.literal("background"), t.literal("foreground")]),
    operation: t.string,
    primary: t.boolean,
    requireAllValid: t.boolean,
    requireSelection: t.boolean,
    schedule: t.union([t.literal("daily"), t.literal("hourly"), t.literal("weekly")]),
    tooltip: t.string,
  }),
]);

const FieldC = t.intersection([
  t.type({
    key: t.string,
    type: t.string,
  }),
  t.partial({
    constraints: t.array(
      t.type({
        type: t.literal("required"),
      }),
    ),
    description: t.string,
    label: t.string,
    metadata: t.UnknownRecord,
    readonly: t.boolean,
    treatments: t.array(t.string),
  }),
]);

const PermissionC = t.union([
  t.literal("*"),
  t.literal("add"),
  t.literal("delete"),
  t.literal("edit"),
  t.literal("import"),
]);

const SheetConfigC = t.intersection([
  t.type({
    fields: t.array(FieldC),
    name: t.string,
  }),
  t.partial({
    access: t.array(PermissionC),
    actions: t.array(CustomActionC),
    allowAdditionalFields: t.boolean,
    description: t.string,
    metadata: t.UnknownRecord,
    readonly: t.boolean,
    slug: t.string,
  }),
]);

export interface SheetId extends Newtype<{ readonly SheetId: unique symbol }, string> {}

export const isoSheetId: Iso<SheetId, string> = iso<SheetId>();

export const SheetIdC = new t.Type<SheetId>(
  "SheetIdFromString",
  (input: unknown): input is SheetId => {
    return Str.isString(input) && /^us_sh_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sh_\w{8}$/g.test(input)
      ? t.success(isoSheetId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const SheetC = t.intersection([
  t.type({
    id: SheetIdC,
    config: SheetConfigC,
    createdAt: t.string,
    name: t.string,
    updatedAt: t.string,
    workbookId: t.string,
  }),
  t.partial({
    countRecords: t.intersection([
      t.type({
        error: t.number,
        total: t.number,
        valid: t.number,
      }),
      t.partial({
        errorsByField: t.UnknownRecord,
      }),
    ]),
    namespace: t.string,
  }),
]);

// ==================
//       Types
// ==================

export type Permission = t.TypeOf<typeof PermissionC>;
export type Sheet = Readonly<t.TypeOf<typeof SheetC>>;
export type Sheets = ReadonlyArray<Sheet>;

// ==================
//       Main
// ==================

/**
 * Delete a `Sheet`.
 *
 * @since 0.1.0
 */
export function deleteSheet(
  sheetId: SheetId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/sheets/${sheetId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.type({ success: t.boolean }))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a `Sheet`.
 *
 * @since 0.1.0
 */
export function getSheet(
  sheetId: SheetId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Sheet>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/sheets/${sheetId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SheetC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Sheet`s.
 *
 * @since 0.1.0
 */
export function listSheets(): RT.ReaderTask<
  ApiReader,
  DecoderErrors | HttpError | Successful<Sheets>
> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/sheets`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(SheetC))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
