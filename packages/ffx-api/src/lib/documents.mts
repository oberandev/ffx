import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/lib/function.js";
import * as RT from "fp-ts/lib/ReaderTask.js";
import * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts/lib";

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

export const DocumentCodec = t.type({
  id: t.string,
  body: t.string,
  environmentId: t.string,
  spaceId: t.string,
  title: t.string,
});

// ==================
//       Types
// ==================

export type Document = Readonly<t.TypeOf<typeof DocumentCodec>>;
export type Documents = ReadonlyArray<Document>;
export type CreateDocumentInput = Pick<Document, "body" | "spaceId" | "title">;
export type DeleteDocumentInput = Pick<Document, "id" | "spaceId">;
export type GetDocumentInput = Pick<Document, "id" | "spaceId">;
export type UpdateDocumentInput = Omit<Document, "environmentId">;

/**
 * Create a `Document`.
 *
 * @since 0.1.0
 */
export function createDocument(
  input: CreateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(
              `${r.baseUrl}/spaces/${input.spaceId}/documents`,
              { body: input.body, title: input.title },
              {
                headers: {
                  "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
                },
              },
            );
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete a `Document`.
 *
 * @since 0.1.0
 */
export function deleteDocument(
  input: DeleteDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`, {
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
 * Get a `Document`.
 *
 * @since 0.1.0
 */
export function getDocument(
  input: GetDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`, {
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
    RTE.chain(decodeWith(DocumentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Document`s.
 *
 * @since 0.1.0
 */
export function listDocuments(
  spaceId: string,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Documents>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${spaceId}/documents`, {
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
    RTE.chain(decodeWith(t.array(DocumentCodec))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Document`.
 *
 * @since 0.1.0
 */
export function updateDocument(
  input: UpdateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(
              `${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`,
              { body: input.body, title: input.title },
              {
                headers: {
                  "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
                },
              },
            );
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
