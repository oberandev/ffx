import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

import { codecSpaceId } from "./documents.mjs";
import { codecEnvironmentId } from "./environments.mjs";
import { codecCustomAction, codecSheet } from "./sheets.mjs";
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

export interface WorkbookId extends Newtype<{ readonly WorkbookId: unique symbol }, string> {}

export const isoWorkbookId: Iso<WorkbookId, string> = iso<WorkbookId>();

export const codecWorkbookId = new t.Type<WorkbookId, WorkbookId, unknown>(
  "WorkbookId",
  (input: unknown): input is WorkbookId => {
    return typeof input === "string" && /^us_wb_\w{8}$/g.test(input);
  },
  (input, context) => {
    return typeof input === "string" && /^us_wb_\w{8}$/g.test(input)
      ? t.success(isoWorkbookId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const codecWorkbook = t.intersection([
  t.type({
    id: codecWorkbookId,
    createdAt: t.string,
    environmentId: codecEnvironmentId,
    name: t.string,
    spaceId: codecSpaceId,
    updatedAt: t.string,
  }),
  t.partial({
    actions: t.array(codecCustomAction),
    labels: t.array(t.string),
    metadata: t.UnknownRecord,
    namespace: t.string,
    sheets: t.array(codecSheet),
  }),
]);

// ==================
//       Types
// ==================

export type Workbook = Readonly<t.TypeOf<typeof codecWorkbook>>;
export type Workbooks = ReadonlyArray<Workbook>;
export type CreateWorkbookInput = Omit<Workbook, "id" | "createdAt" | "updatedAt">;
export type UpdateWorkbookInput = Partial<Omit<Workbook, "id" | "createdAt" | "updatedAt">>;

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
    RTE.chain(decodeWith(codecWorkbook)),
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
    RTE.chain(decodeWith(t.type({ success: t.boolean }))),
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
    RTE.chain(decodeWith(codecWorkbook)),
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
    RTE.chain(decodeWith(t.array(codecWorkbook))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Workbook`.
 *
 * @since 0.1.0
 */
export function updateWorkbook(
  workbookId: WorkbookId,
  input: UpdateWorkbookInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Workbook>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/workbooks/${workbookId}`, input, {
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
    RTE.chain(decodeWith(codecWorkbook)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
