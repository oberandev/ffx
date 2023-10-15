import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";

import {
  ApiReader,
  DecoderErrors,
  HttpError,
  Successful,
  decodeWith,
  mkHttpError,
} from "./http.mjs";
import { SheetId, SheetIdFromString, WorkbookId, WorkbookIdFromString } from "./ids.mjs";

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

export const PermissionC = t.union([
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

export const SheetC = t.intersection([
  t.type({
    id: SheetIdFromString,
    config: SheetConfigC,
    createdAt: DateFromISOString,
    name: t.string,
    updatedAt: DateFromISOString,
    workbookId: WorkbookIdFromString,
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/sheets/${sheetId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.type({ success: t.boolean }))),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/sheets/${sheetId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SheetC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Sheet`s.
 *
 * @since 0.1.0
 */
export function listSheets(
  workbookId: WorkbookId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Sheets>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/sheets`, {
              params: {
                workbookId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(SheetC))),
    RTE.matchW(mkHttpError, identity),
  );
}
