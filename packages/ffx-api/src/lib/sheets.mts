import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

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

export const CustomActionCodec = t.intersection([
  t.strict({
    label: t.string,
  }),
  t.partial({
    confirm: t.boolean,
    description: t.string,
    icon: t.string,
    inputForm: t.strict({
      fields: t.array(
        t.intersection([
          t.strict({
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
            config: t.strict({
              options: t.intersection([
                t.strict({
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
              t.strict({
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

const FieldCodec = t.intersection([
  t.strict({
    key: t.string,
    type: t.string,
  }),
  t.partial({
    constraints: t.array(
      t.strict({
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

const PermissionCodec = t.union([
  t.literal("*"),
  t.literal("add"),
  t.literal("delete"),
  t.literal("edit"),
  t.literal("import"),
]);

const SheetConfigCodec = t.intersection([
  t.strict({
    fields: t.array(FieldCodec),
    name: t.string,
  }),
  t.partial({
    access: t.array(PermissionCodec),
    actions: t.array(CustomActionCodec),
    allowAdditionalFields: t.boolean,
    description: t.string,
    metadata: t.UnknownRecord,
    readonly: t.boolean,
    slug: t.string,
  }),
]);

export const SheetIdCodec = new t.Type<string, string, unknown>(
  "SheetId",
  (input: unknown): input is string => {
    return typeof input === "string" && /^us_sh_\w{8}$/g.test(input);
  },
  (input, context) => {
    return typeof input === "string" && /^us_sh_\w{8}$/g.test(input)
      ? t.success(input)
      : t.failure(input, context);
  },
  t.identity,
);

export const SheetCodec = t.intersection([
  t.strict({
    id: SheetIdCodec,
    config: SheetConfigCodec,
    createdAt: t.string,
    name: t.string,
    updatedAt: t.string,
    workbookId: t.string,
  }),
  t.partial({
    countRecords: t.intersection([
      t.strict({
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

export type Permission = t.TypeOf<typeof PermissionCodec>;
export type Sheet = Readonly<t.TypeOf<typeof SheetCodec>>;
export type SheetId = Readonly<t.TypeOf<typeof SheetIdCodec>>;
export type Sheets = ReadonlyArray<Sheet>;
export type CreateSheetInput = Omit<Sheet, "id">;
export type UpdateSheetInput = Partial<Sheet>;

// ==================
//       Main
// ==================

/**
 * Create a `Sheet`.
 *
 * @since 0.1.0
 */
export function createSheet(
  input: CreateSheetInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Sheet>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/sheets`, input, {
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
    RTE.chain(decodeWith(SheetCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

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
    RTE.chain(decodeWith(t.strict({ success: t.boolean }))),
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
    RTE.chain(decodeWith(SheetCodec)),
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
    RTE.chain(decodeWith(t.array(SheetCodec))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Sheet`.
 *
 * @since 0.1.0
 */
export function updateSheet(
  input: UpdateSheetInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Sheet>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/sheets/${input.id}`, input, {
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
    RTE.chain(decodeWith(SheetCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
