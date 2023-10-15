import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { Buffer } from "node:buffer";
import { ReadStream } from "node:fs";

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
import { CustomActionC } from "./sheets.mjs";

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

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const UpdateFileInputC = t.exact(
  t.partial({
    actions: t.array(CustomActionC),
    mode: ModeC,
    name: t.string,
    status: StatusC,
    workbookId: WorkbookIdFromString,
  }),
);

const UploadFileInputC = t.exact(
  t.intersection([
    t.type({
      environmentId: EnvironmentIdFromString,
      spaceId: SpaceIdFromString,
    }),
    t.partial({
      actions: t.array(CustomActionC),
      mode: ModeC,
    }),
  ]),
);

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

export type File_ = Readonly<t.TypeOf<typeof FileC>>;
export type Files = ReadonlyArray<File_>;
export type FileContents = Readonly<string>;

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
          () => axios.get(`/files/${fileId}/download`, { responseType: "stream" }),
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
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File_>> {
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
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File_>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`/files/${fileId}`, {
              actions: input.actions,
              mode: input.mode,
              name: input.name,
              status: input.status,
              workbookId: input.workbookId,
            });
          },
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
  readable: ReadStream,
  input: UploadFileInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<File_>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            let chunks: Array<any> = [];

            readable.on("readable", () => {
              let chunk;

              while ((chunk = readable.read()) !== null) {
                console.log(`Read ${chunk.length} bytes of data...`);
                console.log("chunk:", chunk);
                chunks.push(chunk);
              }
            });

            readable.on("end", () => {
              console.log("Reached end of stream.");
              readable.removeAllListeners();
              readable.destroy();
            });

            console.log("chunks:", chunks);

            const buffer = Buffer.from(chunks);

            return axios.postForm(`/files`, {
              actions: input.actions,
              environmentId: input.environmentId,
              // file: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
              file: buffer.join(""),
              mode: input.mode,
              spaceId: input.spaceId,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(FileC)),
    RTE.matchW(mkHttpError, identity),
  );
}
