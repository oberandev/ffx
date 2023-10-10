import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { SpaceIdCodec } from "./documents.mjs";
import { EnvironmentIdCodec } from "./environments.mjs";
import { CustomActionCodec, SheetCodec } from "./sheets.mjs";
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

export const WorkbookIdCodec = new t.Type<string, string, unknown>(
  "WorkbookId",
  (input: unknown): input is string => {
    return typeof input === "string" && /^us_wb_\w{8}$/g.test(input);
  },
  (input, context) => {
    return typeof input === "string" && /^us_wb_\w{8}$/g.test(input)
      ? t.success(input)
      : t.failure(input, context);
  },
  t.identity,
);

export const WorkbookCodec = t.intersection([
  t.strict({
    id: WorkbookIdCodec,
    createdAt: t.string,
    environmentId: EnvironmentIdCodec,
    name: t.string,
    spaceId: SpaceIdCodec,
    updatedAt: t.string,
  }),
  t.partial({
    actions: t.array(CustomActionCodec),
    labels: t.array(t.string),
    metadata: t.UnknownRecord,
    namespace: t.string,
    sheets: t.array(SheetCodec),
  }),
]);

// ==================
//       Types
// ==================

export type Workbook = Readonly<t.TypeOf<typeof WorkbookCodec>>;
export type WorkbookId = Readonly<t.TypeOf<typeof WorkbookIdCodec>>;
export type Workbooks = ReadonlyArray<Workbook>;
export type CreateWorkbookInput = Omit<Workbook, "id">;
export type UpdateWorkbookInput = Partial<Workbook>;

// ==================
//       Main
// ==================

/**
 * Create a `Workbook`.
 *
 * @since 0.1.0
 */
export function createWorkbook(
  input: CreateWorkbookInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Workbook>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/workbooks`, input, {
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
    RTE.chain(decodeWith(WorkbookCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete a `Workbook`.
 *
 * @since 0.1.0
 */
export function deleteWorkbook(
  workbookId: WorkbookId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/workbooks/${workbookId}`, {
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
 * Get a `Workbook`.
 *
 * @since 0.1.0
 */
export function getWorkbook(
  workbookId: WorkbookId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Workbook>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/workbooks/${workbookId}`, {
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
    RTE.chain(decodeWith(WorkbookCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Workbook`s.
 *
 * @since 0.1.0
 */
export function listWorkbooks(): RT.ReaderTask<
  ApiReader,
  DecoderErrors | HttpError | Successful<Workbooks>
> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/workbooks`, {
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
    RTE.chain(decodeWith(t.array(WorkbookCodec))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Workbook`.
 *
 * @since 0.1.0
 */
export function updateWorkbook(
  input: UpdateWorkbookInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Workbook>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/workbooks/${input.id}`, input, {
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
    RTE.chain(decodeWith(WorkbookCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
