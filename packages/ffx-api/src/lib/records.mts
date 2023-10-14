import { AxiosError } from "axios";
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
} from "./http.mjs";
import {
  EventIdFromString,
  RecordId,
  RecordIdFromString,
  SheetId,
  VersionIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const RecordC = t.intersection([
  t.type({
    id: RecordIdFromString,
    values: t.UnknownRecord,
  }),
  t.partial({
    messages: t.array(
      t.partial({
        message: t.string,
        source: t.union([
          t.literal("custom-logic"),
          t.literal("invalid-option"),
          t.literal("is-artifact"),
          t.literal("required-constraint"),
          t.literal("unique-constraint"),
          t.literal("unlinked"),
        ]),
        type: t.union([t.literal("error"), t.literal("info"), t.literal("warn")]),
      }),
    ),
    metadata: t.UnknownRecord,
    valid: t.boolean,
    versionId: VersionIdFromString,
  }),
]);

export const RecordsWithMetaC = t.intersection([
  t.type({
    records: t.array(RecordC),
    success: t.boolean,
  }),
  t.partial({
    count: t.intersection([
      t.type({
        error: t.number,
        total: t.number,
        valid: t.number,
      }),
      t.partial({
        errorsByField: t.UnknownRecord,
      }),
    ]),
    versionId: VersionIdFromString,
  }),
]);

const ListRecordsQueryParamsC = t.exact(
  t.partial({
    filter: t.union([t.literal("all"), t.literal("error"), t.literal("none"), t.literal("valid")]),
    filterField: t.string,
    for: EventIdFromString,
    ids: t.array(RecordIdFromString),
    includeLength: t.boolean,
    includeLinks: t.boolean,
    includeMessages: t.boolean,
    pageNumber: t.number,
    pageSize: t.number,
    q: t.string,
    searchField: t.string,
    searchValue: t.string,
    sinceVersionId: VersionIdFromString,
    sortDirection: t.union([t.literal("asc"), t.literal("desc")]),
    sortField: t.string,
    versionId: VersionIdFromString,
  }),
);

const UpdateRecordsQueryParamsC = t.exact(
  t.type({
    for: EventIdFromString,
  }),
);

// ==================
//       Types
// ==================

export type Record = Readonly<t.TypeOf<typeof RecordC>>;
export type Records = Readonly<t.TypeOf<typeof RecordsWithMetaC>>;

export type ListRecordsQueryParams = Readonly<t.TypeOf<typeof ListRecordsQueryParamsC>>;
export type UpdateRecordsQueryParams = Readonly<t.TypeOf<typeof UpdateRecordsQueryParamsC>>;

// ==================
//       Main
// ==================

/**
 * Delete `Record`s by id.
 *
 * @since 0.1.0
 */
export function deleteRecords(
  sheetId: SheetId,
  ids: ReadonlyArray<RecordId>,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`/sheets/${sheetId}/records`, {
              params: {
                ids,
              },
            });
          },
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
 * Insert `Record`s.
 *
 * @since 0.1.0
 */
export function insertRecords(
  sheetId: SheetId,
  input: ReadonlyArray<Record>,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Records>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/sheets/${sheetId}/records`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(RecordsWithMetaC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Record`s.
 *
 * @since 0.1.0
 */
export function listRecords(
  sheetId: SheetId,
  queryParams?: ListRecordsQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Records>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/sheets/${sheetId}/records`, {
              params: queryParams,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(RecordsWithMetaC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Update `Record`s.
 *
 * @since 0.1.0
 */
export function updateRecords(
  sheetId: SheetId,
  input: ReadonlyArray<Record>,
  queryParams?: UpdateRecordsQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Records>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.put(`/sheets/${sheetId}/records`, input, {
              params: queryParams,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(RecordsWithMetaC)),
    RTE.matchW(mkHttpError, identity),
  );
}
