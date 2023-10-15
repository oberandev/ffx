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
import {
  EnvironmentIdFromString,
  SpaceIdFromString,
  WorkbookId,
  WorkbookIdFromString,
} from "./ids.mjs";
import { CustomActionC, SheetC } from "./sheets.mjs";

// ==================
//   Runtime codecs
// ==================

export const WorkbookC = t.intersection([
  t.type({
    id: WorkbookIdFromString,
    createdAt: DateFromISOString,
    environmentId: EnvironmentIdFromString,
    name: t.string,
    spaceId: SpaceIdFromString,
    updatedAt: DateFromISOString,
  }),
  t.partial({
    actions: t.array(CustomActionC),
    labels: t.array(t.string),
    metadata: t.UnknownRecord,
    namespace: t.string,
    sheets: t.array(SheetC),
  }),
]);

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const CreateWorkbookInputC = t.exact(
  t.intersection([
    t.type({
      name: t.string,
    }),
    t.partial({
      actions: t.array(CustomActionC),
      environmentId: EnvironmentIdFromString,
      labels: t.array(t.string),
      metadata: t.UnknownRecord,
      sheets: t.array(SheetC),
      spaceId: SpaceIdFromString,
    }),
  ]),
);

// ==================
//       Types
// ==================

export type Workbook = Readonly<t.TypeOf<typeof WorkbookC>>;
export type Workbooks = ReadonlyArray<Workbook>;

export type CreateWorkbookInput = Readonly<t.TypeOf<typeof CreateWorkbookInputC>>;
export type UpdateWorkbookInput = Partial<CreateWorkbookInput>;

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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/workbooks`, {
              actions: input.actions,
              environmentId: input.environmentId,
              labels: input.labels,
              metadata: input.metadata,
              name: input.name,
              sheets: input.sheets,
              spaceId: input.spaceId,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(WorkbookC)),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/workbooks/${workbookId}`),
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
 * Get a `Workbook`.
 *
 * @since 0.1.0
 */
export function getWorkbook(
  workbookId: WorkbookId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Workbook>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/workbooks/${workbookId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(WorkbookC)),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/workbooks`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(WorkbookC))),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`/workbooks/${workbookId}`, {
              actions: input.actions,
              environmentId: input.environmentId,
              labels: input.labels,
              metadata: input.metadata,
              name: input.name,
              sheets: input.sheets,
              spaceId: input.spaceId,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(WorkbookC)),
    RTE.matchW(mkHttpError, identity),
  );
}
