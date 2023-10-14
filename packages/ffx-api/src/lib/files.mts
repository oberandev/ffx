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
  FileId,
  FileIdFromString,
  SheetIdFromString,
  SpaceIdFromString,
  WorkbookIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const ModeC = t.union([t.literal("export"), t.literal("import")]);

const StatusC = t.union([
  t.literal("archived"),
  t.literal("complete"),
  t.literal("failed"),
  t.literal("partial"),
  t.literal("purged"),
]);

export const FileC = t.intersection([
  t.type({
    id: FileIdFromString,
    bytesReceived: t.number,
    createdAt: DateFromISOString,
    encoding: t.string,
    ext: t.string,
    mimetype: t.string,
    mode: ModeC,
    name: t.string,
    status: StatusC,
    size: t.number,
    spaceId: SpaceIdFromString,
    updatedAt: DateFromISOString,
  }),
  t.partial({
    actions: t.array(CustomActionC),
    sheetId: SheetIdFromString,
    workbookId: WorkbookIdFromString,
  }),
]);

const UpdateFileInputC = t.partial({
  actions: t.array(CustomActionC),
  mode: ModeC,
  name: t.string,
  status: StatusC,
  workbookId: WorkbookIdFromString,
});

const FileContentsC = t.string;

const UploadFileInputC = t.partial({
  actions: t.array(CustomActionC),
  environmentId: EnvironmentIdFromString,
  file: FileContentsC,
  mode: ModeC,
  spaceId: SpaceIdFromString,
});

const ListFilesQueryParamsC = t.exact(
  t.partial({
    mode: ModeC,
    pageNumber: t.number,
    pageSize: t.number,
    spaceId: SpaceIdFromString,
  }),
);

// ==================
//       Types
// ==================

export type File = Readonly<t.TypeOf<typeof FileC>>;
export type Files = ReadonlyArray<File>;
export type FileContents = Readonly<t.TypeOf<typeof FileContentsC>>;

export type UpdateFileInput = Readonly<t.TypeOf<typeof UpdateFileInputC>>;
export type UploadFileInput = Readonly<t.TypeOf<typeof UploadFileInputC>>;
export type ListFilesQueryParams = Readonly<t.TypeOf<typeof ListFilesQueryParamsC>>;

// ==================
//       Main
// ==================

/**
 * Delete a `File`.
 *
 * @since 0.1.0
 */
export function deleteFile(
  fileId: FileId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/files/${fileId}`),
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
 * Upload a `File`.
 *
 * @since 0.1.0
 */
export function downloadFile(
  fileId: FileId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<FileContents>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/files/${fileId}/download`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data),
    RTE.chain(decodeWith(t.string)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a `File`.
 *
 * @since 0.1.0
 */
export function getFile(
  fileId: FileId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/files/${fileId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(FileC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `File`s.
 *
 * @since 0.1.0
 */
export function listFiles(
  queryParams?: ListFilesQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Files>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/files`, {
              params: queryParams,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(FileC))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Update a `File`.
 *
 * @since 0.1.0
 */
export function updateFile(
  fileId: FileId,
  input: UpdateFileInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.patch(`/files/${fileId}`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(FileC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Upload a `File`.
 *
 * @since 0.1.0
 */
export function uploadFile(
  input: UploadFileInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/files`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(FileC)),
    RTE.matchW(mkHttpError, identity),
  );
}
