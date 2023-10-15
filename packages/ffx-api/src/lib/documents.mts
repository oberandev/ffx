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
  DocumentId,
  DocumentIdFromString,
  EnvironmentIdFromString,
  SpaceId,
  SpaceIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

export const DocumentC = t.intersection([
  t.type({
    id: DocumentIdFromString,
    body: t.string,
    environmentId: EnvironmentIdFromString,
    spaceId: SpaceIdFromString,
    title: t.string,
  }),
  t.partial({
    treatments: t.array(t.string),
  }),
]);

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const CreateDocumentInputC = t.exact(
  t.intersection([
    t.type({
      body: t.string,
      title: t.string,
    }),
    t.partial({
      treatments: t.array(t.string),
    }),
  ]),
);

// ==================
//       Types
// ==================

export type Document = Readonly<t.TypeOf<typeof DocumentC>>;
export type Documents = ReadonlyArray<Document>;

export type CreateDocumentInput = Readonly<t.TypeOf<typeof CreateDocumentInputC>>;
export type UpdateDocumentInput = Readonly<t.TypeOf<typeof CreateDocumentInputC>>;

// ==================
//       Main
// ==================

/**
 * Create a `Document`.
 *
 * @since 0.1.0
 */
export function createDocument(
  spaceId: SpaceId,
  input: CreateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/spaces/${spaceId}/documents`, {
              body: input.body,
              title: input.title,
              treatments: input.treatments,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Delete a `Document`.
 *
 * @since 0.1.0
 */
export function deleteDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/spaces/${spaceId}/documents/${documentId}`),
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
 * Get a `Document`.
 *
 * @since 0.1.0
 */
export function getDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/spaces/${spaceId}/documents/${documentId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Document`s.
 *
 * @since 0.1.0
 */
export function listDocuments(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Documents>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/spaces/${spaceId}/documents`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(DocumentC))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Update a `Document`.
 *
 * @since 0.1.0
 */
export function updateDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
  input: UpdateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`/spaces/${spaceId}/documents/${documentId}`, {
              body: input.body,
              title: input.title,
              treatments: input.treatments,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW(mkHttpError, identity),
  );
}
