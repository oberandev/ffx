import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import {
  EnvironmentIdFromString,
  SpaceIdFromString,
  WorkbookId,
  WorkbookIdFromString,
} from "./ids.mjs";
import { CustomActionC, SheetC } from "./sheets.mjs";
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

export const WorkbookC = t.intersection(
  [
    t.type({
      id: WorkbookIdFromString,
      createdAt: t.string,
      environmentId: EnvironmentIdFromString,
      name: t.string,
      spaceId: SpaceIdFromString,
      updatedAt: t.string,
    }),
    t.partial({
      actions: t.array(CustomActionC),
      labels: t.array(t.string),
      metadata: t.UnknownRecord,
      namespace: t.string,
      sheets: t.array(SheetC),
    }),
  ],
  "WorkbookC",
);

// ==================
//       Types
// ==================

export type Workbook = Readonly<t.TypeOf<typeof WorkbookC>>;
export type Workbooks = ReadonlyArray<Workbook>;
// export type CreateWorkbookInput = Omit<Workbook, "id" | "createdAt" | "updatedAt">;
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
    RTE.chain(decodeWith(WorkbookC)),
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
    RTE.chain(decodeWith(WorkbookC)),
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
    RTE.chain(decodeWith(t.array(WorkbookC))),
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
    RTE.chain(decodeWith(WorkbookC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
